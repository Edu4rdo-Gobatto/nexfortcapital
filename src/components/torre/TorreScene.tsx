"use client";

import { Canvas, invalidate, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { attachScene, CAMERA, sampleIntroFrame, stepRig, type TorreRig } from "./choreography";
import { TORRE_HEIGHT } from "./geometry";
import { Torre } from "./Torre";

/**
 * Cena 3D, carregada sob demanda pelo palco (next/dynamic, sem SSR).
 *
 * Quadros: frameloop="demand" — só desenha quando a rolagem, a Chegada ou o amortecimento pedem.
 * Com a página parada, a placa de vídeo descansa.
 *
 * Montagem sem travar a página: o canvas nasce parado (frameloop="never"). Primeiro o estúdio vira um
 * mapa de ambiente (PMREM), depois os shaders compilam em paralelo (compileAsync, fora da thread
 * principal) e as texturas sobem para a GPU. Só então o primeiro quadro é desenhado e a Chegada começa.
 * Sem isso, o primeiro quadro compilava o MeshPhysicalMaterial de forma síncrona: ~1,6 s de página travada.
 *
 * O three.js é imperativo: as escritas por quadro ficam nas funções abaixo, fora dos componentes.
 */

type RigRef = RefObject<TorreRig | null>;

const BASE_Y = -1.2; // na ponta do fundo abaulado da Torre
const DAMPING = 12; // amortecimento da pose (1/s): peso de objeto, sem atraso perceptível
const SHADOW_OPACITY = 0.55;

const STUDIO_SIZE = 512; // em 256 a borda das luzes refletidas serrilha na laca

/**
 * Estúdio fotográfico: softbox principal, filete de recorte à esquerda (os brilhos que o logo desenha),
 * contraluz, teto e o chão claro refletido (da cor do fundo da página: --color-paper).
 */
function studioScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#2b2a33");
  const plane = new THREE.PlaneGeometry(1, 1);
  const disc = new THREE.CircleGeometry(1, 48);
  const light = (geometry: THREE.BufferGeometry, intensity: number, position: [number, number, number], scale: [number, number, number], color = "#ffffff") => {
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), toneMapped: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(...scale);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
  };
  light(plane, 2.6, [3, 3.5, 6], [7, 5, 1]); // softbox principal
  light(plane, 7, [-5, 1, 1.5], [0.5, 9, 1]); // filete de recorte à esquerda
  light(plane, 1.6, [5.5, 0, -2], [1.6, 7, 1]); // contraluz
  light(disc, 2.2, [0, 8, 0], [4, 4, 1]); // teto
  light(plane, 0.8, [0, -6, 0], [14, 14, 1], "#f6f5f9"); // chão: o fundo da página (--color-paper)
  const dispose = () => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) (obj.material as THREE.Material).dispose();
    });
    plane.dispose();
    disc.dispose();
  };
  return { scene, dispose };
}

/** Partes internas do PMREMGenerator do three r187 (privadas; checadas antes do uso). */
type PmremInternals = {
  _setSize(size: number): void;
  _allocateTarget(): THREE.WebGLRenderTarget;
  _getSourceTarget(depthBuffer?: boolean): THREE.WebGLRenderTarget;
  _applyPMREM(target: THREE.WebGLRenderTarget): void;
  _renderCube(...args: unknown[]): void;
  _ggxMaterial: THREE.Material | null;
  _integrationMaterial: THREE.Material | null;
};

/**
 * Cria os materiais internos do PMREM sem desenhar nada, para compilá-los em paralelo antes do uso.
 * O shader GGX do PMREM (256 amostras) leva ~650 ms para compilar no Windows (ANGLE/D3D11); sem isto,
 * a compilação acontece no primeiro desenho e trava a página. Se a API interna mudar, devolve null e o
 * fromScene segue o caminho normal.
 */
function pmremWarmup(pmrem: THREE.PMREMGenerator) {
  const p = pmrem as unknown as PmremInternals;
  const api = [p._setSize, p._allocateTarget, p._getSourceTarget, p._applyPMREM, p._renderCube];
  if (api.some((fn) => typeof fn !== "function")) return null;
  const renderCube = p._renderCube;
  p._renderCube = () => {};
  try {
    p._setSize(STUDIO_SIZE);
    const target = p._allocateTarget();
    p._getSourceTarget(true);
    p._applyPMREM(target);
    const materials = [p._ggxMaterial, p._integrationMaterial].filter((m): m is THREE.Material => m instanceof THREE.Material);
    return { target, materials };
  } catch {
    return null;
  } finally {
    p._renderCube = renderCube;
  }
}

/**
 * O estúdio vira um mapa de ambiente (PMREM). Antes, os shaders do PMREM e das luzes compilam em
 * paralelo com o alvo do PMREM ativo (o programa depende dele: espaço de cor linear, sem tone mapping).
 */
async function buildStudio(gl: THREE.WebGLRenderer, camera: THREE.Camera) {
  const studio = studioScene();
  const pmrem = new THREE.PMREMGenerator(gl);
  const warm = pmremWarmup(pmrem);
  if (warm) {
    const box = new THREE.BoxGeometry();
    const passes = new THREE.Scene();
    for (const material of warm.materials) passes.add(new THREE.Mesh(box, material));
    const previous = gl.getRenderTarget();
    gl.setRenderTarget(warm.target);
    const ready = Promise.all([gl.compileAsync(passes, camera), gl.compileAsync(studio.scene, camera)]);
    gl.setRenderTarget(previous);
    await ready.catch(() => undefined);
    box.dispose();
    warm.target.dispose();
  }
  const target = pmrem.fromScene(studio.scene, 0, 0.1, 100, { size: STUDIO_SIZE });
  pmrem.dispose();
  studio.dispose();
  return target;
}

function setEnvironment(scene: THREE.Scene, texture: THREE.Texture | null) {
  scene.environment = texture;
}

/** Sobe as texturas da cena para a GPU antes do primeiro quadro. */
function uploadTextures(gl: THREE.WebGLRenderer, scene: THREE.Scene) {
  scene.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const material = obj.material as THREE.MeshStandardMaterial;
    for (const texture of [material.map, material.roughnessMap, material.metalnessMap, material.bumpMap]) {
      if (texture) gl.initTexture(texture);
    }
  });
}

/** Chegada: o estúdio acende de 12% a 100%; a luz direta sai do zero. */
function applyLights(scene: THREE.Scene, key: THREE.DirectionalLight | null, light: number) {
  scene.environmentIntensity = 0.12 + 0.88 * light;
  if (key) key.intensity = 1.1 * light;
}

/** Pose amortecida no grupo: gira no próprio eixo, depois inclina para a câmera (ordem XYZ). */
function applyPose(group: THREE.Group, rig: TorreRig) {
  const c = rig.current;
  group.position.set(c.x, c.y, 0);
  group.scale.setScalar(c.h / TORRE_HEIGHT);
  group.rotation.set(c.tilt, c.rot + rig.intro.spin, 0);
}

function applyShadow(shadow: THREE.Mesh | null, rig: TorreRig) {
  if (shadow?.material instanceof THREE.Material) {
    shadow.material.opacity = SHADOW_OPACITY * rig.current.shadow * rig.intro.light;
  }
}

/**
 * Sombra de contato pré-calculada: a base é redonda, então a sombra é um degradê radial (núcleo escuro sob
 * a borda do plinto, penumbra larga). Sem passe extra de render e igual em qualquer quadro.
 */
function shadowTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const c = size / 2;
    const soft = ctx.createRadialGradient(c, c, 0, c, c, c);
    soft.addColorStop(0, "rgba(20,18,43,0.55)");
    soft.addColorStop(0.42, "rgba(20,18,43,0.38)");
    soft.addColorStop(0.62, "rgba(20,18,43,0.12)");
    soft.addColorStop(1, "rgba(20,18,43,0)");
    ctx.fillStyle = soft;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function BakedShadow({ meshRef }: { meshRef: RefObject<THREE.Mesh | null> }) {
  const texture = useMemo(() => shadowTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh ref={meshRef} position={[0, BASE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={2.1} renderOrder={-1}>
      <planeGeometry />
      <meshBasicMaterial map={texture} transparent depthWrite={false} opacity={0} />
    </mesh>
  );
}

/** Luz direta da Chegada (o ambiente vem do estúdio em PMREM). */
function KeyLight({ rigRef }: { rigRef: RigRef }) {
  const key = useRef<THREE.DirectionalLight>(null);
  useFrame((state) => applyLights(state.scene, key.current, rigRef.current?.intro.light ?? 0));
  return <directionalLight ref={key} position={[4, 6, 8]} intensity={0} />;
}

/** Liga a pose amortecida ao grupo da Torre e pede quadros até assentar. */
function Rig({ rigRef, children }: { rigRef: RigRef; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const sample = useRef({ count: 0, time: 0 });

  useFrame((state, delta) => {
    const rig = rigRef.current;
    if (!rig || !group.current) return;
    const moving = stepRig(rig, delta, DAMPING);
    applyPose(group.current, rig);
    applyShadow(shadow.current, rig);
    sampleIntroFrame(rig, sample.current, delta);
    if (moving) state.invalidate();
  });

  return (
    <group ref={group}>
      {children}
      <BakedShadow meshRef={shadow} />
    </group>
  );
}

/** Prepara tudo com o canvas parado e avisa quando o primeiro quadro pode ser desenhado. */
function Prepare({ onPrepared }: { onPrepared: () => void }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const done = useRef(onPrepared);

  useEffect(() => {
    let cancelled = false;
    let studio: THREE.WebGLRenderTarget | null = null;
    // marcas de tempo (User Timing): aparecem no painel Performance do DevTools
    const prepare = async () => {
      performance.mark("torre:estudio");
      studio = await buildStudio(gl, camera);
      if (cancelled) return;
      setEnvironment(scene, studio.texture);
      uploadTextures(gl, scene);
      performance.mark("torre:compilacao");
      await gl.compileAsync(scene, camera).catch((error: unknown) => console.warn("Torre: compilação paralela indisponível", error));
      performance.measure("torre: estúdio (PMREM)", "torre:estudio", "torre:compilacao");
      performance.measure("torre: compilação dos shaders", "torre:compilacao");
      if (!cancelled) done.current();
    };
    void prepare();
    return () => {
      cancelled = true;
      setEnvironment(scene, null);
      studio?.dispose();
    };
  }, [gl, scene, camera]);
  return null;
}

export default function TorreScene({ rigRef }: { rigRef: RigRef }) {
  const [maxDpr, setMaxDpr] = useState(1.75);
  const [frameloop, setFrameloop] = useState<"never" | "demand">("never");

  useEffect(() => {
    const rig = rigRef.current;
    if (!rig) return;
    return attachScene(rig, { invalidate: () => invalidate(), onSlow: () => setMaxDpr(1) });
  }, [rigRef]);

  // o canvas já está em "demand" quando este efeito roda (os efeitos do Canvas rodam antes): primeiro
  // quadro, com os shaders prontos, e a Chegada
  useEffect(() => {
    if (frameloop !== "demand") return;
    invalidate();
    rigRef.current?.onReady?.();
  }, [frameloop, rigRef]);

  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, maxDpr]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.NeutralToneMapping }}
      camera={{ fov: CAMERA.fov, near: 1, far: 100, position: [0, 0, CAMERA.z] }}
      style={{ position: "absolute", inset: 0 }}
    >
      <KeyLight rigRef={rigRef} />
      <Rig rigRef={rigRef}>
        <Torre />
      </Rig>
      <Prepare onPrepared={() => setFrameloop("demand")} />
    </Canvas>
  );
}
