"use client";

import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { TORRE_MERLONS, TORRE_NAVY, TORRE_PROFILE } from "./geometry";
import { MIOLO_GRADIENT, MIOLO_PATH } from "./miolo";

/**
 * A Torre do logo como objeto: corpo de revolução (perfil medido no logo), ameias em volta e o urso e o
 * touro como incrustação na frente. O corpo é dividido em duas metades: a da frente recebe a textura do
 * miolo projetada de frente (a vista frontal fica idêntica ao logo); a de trás é só laca azul-marinho.
 */

const RADIAL_SEGMENTS = 144;

/** Caixa da textura frontal, em unidades com y PARA BAIXO (o mesmo sistema de MIOLO_PATH). */
const TEX = { x0: -0.66, x1: 0.66, y0: -0.1, y1: 1.24, size: 1024 };

/** Laca: base acetinada sob um verniz brilhante. Incrustação: metal quente sob o mesmo verniz. */
const FINISH = {
  navyRoughness: 0.42,
  mioloRoughness: 0.4,
  mioloMetalness: 0.3,
  clearcoat: 1,
  clearcoatRoughness: 0.1, // laca acetinada: reflexos nítidos, sem cara de plástico espelhado
};

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

function mioloTextures(maxAnisotropy: number) {
  const path = new Path2D(MIOLO_PATH);

  // cor: azul-marinho de fundo e o degradê medido no logo dentro do urso e do touro
  const color = canvas2d();
  color.ctx.fillStyle = TORRE_NAVY;
  color.ctx.fillRect(0, 0, TEX.size, TEX.size);
  toUnits(color.ctx);
  const gradient = color.ctx.createLinearGradient(0, MIOLO_GRADIENT.y0, 0, MIOLO_GRADIENT.y1);
  for (const [offset, stop] of MIOLO_GRADIENT.stops) gradient.addColorStop(offset, stop);
  color.ctx.fillStyle = gradient;
  color.ctx.fill(path, "evenodd");

  // acabamento (canal G = rugosidade, B = metal), como o three.js lê roughnessMap/metalnessMap
  const finish = canvas2d();
  finish.ctx.fillStyle = `rgb(0 ${Math.round(FINISH.navyRoughness * 255)} 0)`;
  finish.ctx.fillRect(0, 0, TEX.size, TEX.size);
  toUnits(finish.ctx);
  finish.ctx.fillStyle = `rgb(0 ${Math.round(FINISH.mioloRoughness * 255)} ${Math.round(FINISH.mioloMetalness * 255)})`;
  finish.ctx.fill(path, "evenodd");

  // relevo: a incrustação fica um fio acima da laca, com borda macia
  const relief = canvas2d();
  relief.ctx.fillStyle = "#000";
  relief.ctx.fillRect(0, 0, TEX.size, TEX.size);
  relief.ctx.filter = "blur(2px)";
  toUnits(relief.ctx);
  relief.ctx.fillStyle = "#fff";
  relief.ctx.fill(path, "evenodd");

  const make = (canvas: HTMLCanvasElement, srgb: boolean) => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.anisotropy = Math.min(8, maxAnisotropy);
    return texture;
  };
  return { map: make(color.canvas, true), finish: make(finish.canvas, false), relief: make(relief.canvas, false) };
}

/**
 * Um ponto da textura que é só laca azul-marinho (canto de cima, à esquerda do miolo): a metade de trás e
 * as ameias apontam o UV para ele. Assim a Torre inteira usa UM material, um shader só para compilar
 * (o MeshPhysicalMaterial com verniz é o shader mais caro da cena).
 */
const NAVY_UV = [0.01, 0.99] as const;

function flatNavyUVs(geometry: THREE.BufferGeometry) {
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, NAVY_UV[0], NAVY_UV[1]);
  uv.needsUpdate = true;
}

/** UV planar de frente: a textura cai sobre a metade frontal exatamente como o desenho do logo. */
function projectFrontUVs(geometry: THREE.BufferGeometry) {
  const position = geometry.getAttribute("position");
  const uv = geometry.getAttribute("uv") as THREE.BufferAttribute;
  for (let i = 0; i < position.count; i++) {
    const u = (position.getX(i) - TEX.x0) / (TEX.x1 - TEX.x0);
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
    projectFrontUVs(front);
    const back = new THREE.LatheGeometry(points, RADIAL_SEGMENTS / 2, Math.PI / 2, Math.PI);
    flatNavyUVs(back);
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
