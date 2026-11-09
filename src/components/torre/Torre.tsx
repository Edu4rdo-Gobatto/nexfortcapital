"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { TORRE_MERLONS, TORRE_NAVY, TORRE_PROFILE } from "./geometry";
import { MIOLO_GRADIENT, MIOLO_PATH } from "./miolo";

/**
 * A Torre do logo como objeto: corpo de revolução (perfil medido no logo), ameias em volta e o urso e o
 * touro como incrustação nas DUAS faces. O corpo é dividido em duas metades que usam a mesma textura do
 * miolo e o mesmo material: a da frente a recebe projetada de frente (a vista frontal fica idêntica ao
 * logo); a de trás, projetada de trás e espelhada em x, para o desenho ler certo de lá também.
 */

const RADIAL_SEGMENTS = 144;

/** Caixa da textura frontal, em unidades com y PARA BAIXO (o mesmo sistema de MIOLO_PATH). */
const TEX = { x0: -0.66, x1: 0.66, y0: -0.1, y1: 1.24, size: 1024 };

/**
 * Emenda lateral: em 90° e 270° o miolo de uma face encontra o azul da outra (o verso é espelhado, então o lado
 * quente de uma encosta no lado azul da outra). O miolo esmaece para azul-marinho nesta fração do raio, linha a
 * linha, e a emenda some. De frente a diferença é uma borda marinho de ~3 px no limite do desenho; 0 desliga.
 */
const LIMB_FADE = 0.06;
const LIMB_STEPS = 10;

/** Laca: base acetinada sob um verniz brilhante. Incrustação: metal quente sob o mesmo verniz. */
const FINISH = {
  navyRoughness: 0.42,
  mioloRoughness: 0.4,
  mioloMetalness: 0.3,
  clearcoat: 1,
  clearcoatRoughness: 0.1, // laca acetinada: reflexos nítidos, sem cara de plástico espelhado
};

/** Acabamento da laca azul-marinho nos canais que o three.js lê (G = rugosidade, B = metal): fundo da textura e do esmaecimento. */
const NAVY_FINISH = `rgb(0 ${Math.round(FINISH.navyRoughness * 255)} 0)`;

function canvas2d() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = TEX.size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível");
  return { canvas, ctx };
}

/** Coloca o contexto no sistema de unidades do miolo (x centrado no eixo, y para baixo). */
function toUnits(ctx: CanvasRenderingContext2D) {
  const sx = TEX.size / (TEX.x1 - TEX.x0);
  const sy = TEX.size / (TEX.y1 - TEX.y0);
  ctx.setTransform(sx, 0, 0, sy, -TEX.x0 * sx, -TEX.y0 * sy);
}

/**
 * Anéis do esmaecimento do limbo: um caminho por camada (os dois lados juntos), nas unidades do miolo. Cada anel vai
 * de uma fração do raio r(y) do perfil até um pouco além da silhueta (o que está fora não aparece), então a faixa
 * segue a forma da Torre linha a linha sem varrer pixels. Construídos uma vez e usados nas três texturas.
 */
function limbRings() {
  const reach = 0.03;
  return Array.from({ length: LIMB_STEPS }, (_, step) => {
    const inner = 1 - LIMB_FADE * (1 - step / LIMB_STEPS);
    const ring = new Path2D();
    for (const side of [1, -1]) {
      TORRE_PROFILE.forEach(([r, y], i) => (i === 0 ? ring.moveTo(side * r * inner, -y) : ring.lineTo(side * r * inner, -y)));
      for (let i = TORRE_PROFILE.length - 1; i >= 0; i--) ring.lineTo(side * (TORRE_PROFILE[i][0] + reach), -TORRE_PROFILE[i][1]);
      ring.closePath();
    }
    return ring;
  });
}

/**
 * Cobre, de dentro para fora, a faixa do limbo com a cor de fundo em camadas de opacidade crescente (smoothstep):
 * um degradê feito de anéis. A opacidade acumulada de cada região é a do smoothstep; a de cada camada, o que falta.
 */
function fadeLimbs(ctx: CanvasRenderingContext2D, rings: Path2D[], background: string) {
  let previous = 0; // opacidade acumulada até a camada anterior
  ctx.fillStyle = background;
  rings.forEach((ring, step) => {
    const total = THREE.MathUtils.smoothstep((step + 1) / rings.length, 0, 1); // chega a 1 no último anel
    ctx.globalAlpha = 1 - (1 - total) / (1 - previous);
    previous = total;
    ctx.fill(ring);
  });
  ctx.globalAlpha = 1;
}

function mioloTextures(maxAnisotropy: number) {
  const path = new Path2D(MIOLO_PATH);
  const rings = limbRings();

  // cor: azul-marinho de fundo e o degradê medido no logo dentro do urso e do touro
  const color = canvas2d();
  color.ctx.fillStyle = TORRE_NAVY;
  color.ctx.fillRect(0, 0, TEX.size, TEX.size);
  toUnits(color.ctx);
  const gradient = color.ctx.createLinearGradient(0, MIOLO_GRADIENT.y0, 0, MIOLO_GRADIENT.y1);
  for (const [offset, stop] of MIOLO_GRADIENT.stops) gradient.addColorStop(offset, stop);
  color.ctx.fillStyle = gradient;
  color.ctx.fill(path, "evenodd");
  fadeLimbs(color.ctx, rings, TORRE_NAVY);

  // acabamento (canal G = rugosidade, B = metal), como o three.js lê roughnessMap/metalnessMap
  const finish = canvas2d();
  finish.ctx.fillStyle = NAVY_FINISH;
  finish.ctx.fillRect(0, 0, TEX.size, TEX.size);
  toUnits(finish.ctx);
  finish.ctx.fillStyle = `rgb(0 ${Math.round(FINISH.mioloRoughness * 255)} ${Math.round(FINISH.mioloMetalness * 255)})`;
  finish.ctx.fill(path, "evenodd");
  fadeLimbs(finish.ctx, rings, NAVY_FINISH);

  // relevo: a incrustação fica um fio acima da laca, com borda macia
  const relief = canvas2d();
  relief.ctx.fillStyle = "#000";
  relief.ctx.fillRect(0, 0, TEX.size, TEX.size);
  relief.ctx.filter = "blur(2px)"; // fica ligado de propósito: o esmaecimento do limbo, mais abaixo, também sai macio no relevo
  toUnits(relief.ctx);
  relief.ctx.fillStyle = "#fff";
  relief.ctx.fill(path, "evenodd");
  fadeLimbs(relief.ctx, rings, "#000");

  const make = (canvas: HTMLCanvasElement, srgb: boolean) => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.anisotropy = Math.min(8, maxAnisotropy);
    return texture;
  };
  return { map: make(color.canvas, true), finish: make(finish.canvas, false), relief: make(relief.canvas, false) };
}

/**
 * Um ponto da textura que é só laca azul-marinho (canto de cima, à esquerda do miolo): as ameias apontam o
 * UV para ele. Assim a Torre inteira usa UM material, um shader só para compilar (o MeshPhysicalMaterial
 * com verniz é o shader mais caro da cena).
 */
const NAVY_UV = [0.01, 0.99] as const;

function flatNavyUVs(geometry: THREE.BufferGeometry) {
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, NAVY_UV[0], NAVY_UV[1]);
  uv.needsUpdate = true;
}

/**
 * UV planar: a textura cai sobre a metade como o desenho do logo. De frente, u cresce com x. No verso a
 * projeção é espelhada, u = (−x − x0) / (x1 − x0): quem olha de trás vê o x do mundo invertido, e o desenho
 * lê certo (a caixa da textura é simétrica em x, então o espelho cai no mesmo retângulo).
 */
function projectUVs(geometry: THREE.BufferGeometry, mirror: boolean) {
  const position = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const x = mirror ? -position.getX(i) : position.getX(i);
    const u = (x - TEX.x0) / (TEX.x1 - TEX.x0);
    const v = 1 - (-position.getY(i) - TEX.y0) / (TEX.y1 - TEX.y0);
    uv.setXY(i, u, v);
  }
  uv.needsUpdate = true;
}

/** Uma ameia: anel entre os raios interno e externo, do piso da coroa ao topo, com cantos arredondados. */
function merlonGeometry(a0: number, a1: number) {
  const { innerRadius, outerRadius, bottom, top } = TORRE_MERLONS;
  const bevel = 0.014;
  const ri = innerRadius + bevel;
  const ro = outerRadius - bevel;
  const da = bevel / outerRadius;
  const start = a0 + da;
  const end = a1 - da;
  const steps = 24;

  // forma no plano XY; depois de rotateX(-90°): x do mundo = x, z do mundo = -y (0 rad = frente, +z)
  const shape = new THREE.Shape();
  for (let k = 0; k <= steps; k++) {
    const a = start + ((end - start) * k) / steps;
    const x = ro * Math.sin(a);
    const y = -ro * Math.cos(a);
    if (k === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  for (let k = steps; k >= 0; k--) {
    const a = start + ((end - start) * k) / steps;
    shape.lineTo(ri * Math.sin(a), -ri * Math.cos(a));
  }
  shape.closePath();

  const sink = 0.02; // entra um pouco no piso, sem fresta
  const height = top - bottom + sink;
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height - 2 * bevel,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, bottom - sink + bevel, 0);
  return geometry;
}

export function Torre() {
  const maxAnisotropy = useThree((state) => state.gl.capabilities.getMaxAnisotropy());

  const parts = useMemo(() => {
    const points = TORRE_PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
    const front = new THREE.LatheGeometry(points, RADIAL_SEGMENTS / 2, -Math.PI / 2, Math.PI);
    projectUVs(front, false);
    const back = new THREE.LatheGeometry(points, RADIAL_SEGMENTS / 2, Math.PI / 2, Math.PI);
    projectUVs(back, true);
    const merlons = mergeGeometries(TORRE_MERLONS.spans.map(([a0, a1]) => merlonGeometry(a0, a1)));
    flatNavyUVs(merlons);

    const textures = mioloTextures(maxAnisotropy);
    const material = new THREE.MeshPhysicalMaterial({
      map: textures.map,
      roughnessMap: textures.finish,
      metalnessMap: textures.finish,
      roughness: 1,
      metalness: 1,
      bumpMap: textures.relief,
      bumpScale: 0.6,
      clearcoat: FINISH.clearcoat,
      clearcoatRoughness: FINISH.clearcoatRoughness,
    });
    return { front, back, merlons, material, textures };
  }, [maxAnisotropy]);

  useEffect(
    () => () => {
      parts.front.dispose();
      parts.back.dispose();
      parts.merlons.dispose();
      parts.material.dispose();
      Object.values(parts.textures).forEach((texture) => texture.dispose());
    },
    [parts],
  );

  return (
    <group>
      <mesh geometry={parts.front} material={parts.material} />
      <mesh geometry={parts.back} material={parts.material} />
      <mesh geometry={parts.merlons} material={parts.material} />
    </group>
  );
}
