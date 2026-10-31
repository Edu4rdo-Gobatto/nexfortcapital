"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { SPRING_SMOOTH } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** Inclinação máxima, em graus. */
const MAX_TILT_DEG = 6;
/** Quanto a borda pode avançar ou recuar no eixo Z (px). Limita o ângulo dos cards grandes. */
const MAX_EDGE_DEPTH = 28;

/**
 * Luz que segue o cursor. `ring`: só aparece no filete de 1px (a superfície opaca cobre o resto).
 * `surface`: brilho difuso por baixo do conteúdo. Gradientes estáticos: quem se move é o elemento (x/y).
 */
const TONES = {
  royal: {
    ring: "radial-gradient(circle closest-side, rgb(248 250 252), rgb(248 250 252 / 0.85) 16%, rgb(59 85 196 / 0.9) 42%, rgb(59 85 196 / 0) 100%)",
    surface: "radial-gradient(circle closest-side, rgb(59 85 196 / 0.2), rgb(59 85 196 / 0) 100%)",
  },
  bull: {
    ring: "radial-gradient(circle closest-side, rgb(248 250 252), rgb(245 158 11 / 0.95) 20%, rgb(234 88 12 / 0.6) 55%, rgb(234 88 12 / 0) 100%)",
    surface:
      "radial-gradient(circle closest-side, rgb(245 158 11 / 0.13), rgb(234 88 12 / 0.06) 50%, rgb(234 88 12 / 0) 100%)",
  },
} as const;

/**
 * Chanfro do canto superior direito. A superfície (inset 1px) corta ~0,6px a menos
 * (c − 2 + √2) para que o filete diagonal tenha a mesma espessura de 1px das bordas retas.
 */
const CUTS = {
  md: { ring: "[--cut:18px]", surface: "[--cut:17.4px]" },
  lg: { ring: "[--cut:22px] lg:[--cut:28px]", surface: "[--cut:21.4px] lg:[--cut:27.4px]" },
  xl: { ring: "[--cut:26px] lg:[--cut:36px]", surface: "[--cut:25.4px] lg:[--cut:35.4px]" },
} as const;

export type TiltTone = keyof typeof TONES;
export type TiltCut = keyof typeof CUTS;

type TiltCardProps = {
  children: ReactNode;
  /** Cor da luz: `royal` (estrutura, proteção) ou `bull` (multiplicação). */
  tone?: TiltTone;
  cut?: TiltCut;
  className?: string;
};

/** Maior ângulo (graus) que mantém a borda de um lado deste tamanho dentro de MAX_EDGE_DEPTH. */
function maxAngleFor(size: number) {
  if (size <= 0) return 0;
  const ratio = Math.min(1, (2 * MAX_EDGE_DEPTH) / size);
  return Math.min(MAX_TILT_DEG, (Math.asin(ratio) * 180) / Math.PI);
}

/**
 * Laje de concreto interativa: inclinação 3D com mola e um holofote que acende o filete da borda sob o cursor.
 * Camadas: anel recortado (filete + luz móvel) → superfície opaca a 1px (brilho interno) → conteúdo.
 * O conteúdo fica fora das camadas recortadas, então o anel de foco dos links nunca é cortado.
 * Só para ponteiros finos: toque e `prefers-reduced-motion` mantêm o card estático.
 */
export function TiltCard({ children, tone = "royal", cut = "md", className }: TiltCardProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion(); // null no servidor: lido apenas nos handlers

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, SPRING_SMOOTH);
  const rotateY = useSpring(tiltY, SPRING_SMOOTH);

  const lightX = useMotionValue(0);
  const lightY = useMotionValue(0);
  const lightLevel = useMotionValue(0);
  const lightOpacity = useSpring(lightLevel, SPRING_SMOOTH);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType === "touch" || !areaRef.current) return;
    // A medição é feita no invólucro estático (não inclinado), evitando realimentação.
    const { left, top, width, height } = areaRef.current.getBoundingClientRect();
    if (!width || !height) return;
    const x = event.clientX - left;
    const y = event.clientY - top;
    lightX.set(x);
    lightY.set(y);
    lightLevel.set(1);
    // O lado sob o cursor recua, como uma laje pressionada.
    tiltY.set((x / width - 0.5) * 2 * maxAngleFor(width));
    tiltX.set((0.5 - y / height) * 2 * maxAngleFor(height));
  }

  function handlePointerLeave() {
    tiltX.set(0);
    tiltY.set(0);
    lightLevel.set(0);
  }

  const light = TONES[tone];
  const cuts = CUTS[cut];

  return (
    <div
      ref={areaRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn("h-full perspective-distant", className)}
    >
      <motion.div style={{ rotateX, rotateY }} className="group/tilt relative isolate h-full">
        <div
          aria-hidden="true"
          className={cn(
            "clip-chamfer absolute inset-0 overflow-hidden bg-white/8 group-hover/tilt:bg-white/12 group-focus-within/tilt:bg-white/30",
            cuts.ring,
          )}
        >
          <motion.div
            className="pointer-events-none absolute -top-60 -left-60 size-120"
            style={{ x: lightX, y: lightY, opacity: lightOpacity, backgroundImage: light.ring }}
          />
        </div>
        <div
          aria-hidden="true"
          className={cn("clip-chamfer concrete-noise absolute inset-px overflow-hidden bg-concrete", cuts.surface)}
        >
          <motion.div
            className="pointer-events-none absolute -top-70 -left-70 size-140"
            style={{ x: lightX, y: lightY, opacity: lightOpacity, backgroundImage: light.surface }}
          />
        </div>
        <div className="relative h-full">{children}</div>
      </motion.div>
    </div>
  );
}
