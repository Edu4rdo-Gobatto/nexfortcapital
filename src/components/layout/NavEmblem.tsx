"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { BULL_BOUNDS, BULL_PATH, EMBLEM_VIEWBOX, ROOK_GROOVE_PATH, ROOK_PATH } from "@/components/brand/geometry";
import { EASE_OUT_EXPO } from "@/lib/animations";

/**
 * Bloco de calor: cobre a caixa do touro com folga e passa da ponta direita dele, para que a frente
 * incandescente (centrada na borda do bloco) fique inteira fora do recorte quando a varredura termina.
 */
const EDGE_WIDTH = 16;
const HEAT = {
  x: BULL_BOUNDS.x - 2,
  y: BULL_BOUNDS.y - 2,
  width: BULL_BOUNDS.width + 4 + EDGE_WIDTH,
  height: BULL_BOUNDS.height + 4,
} as const;
const HEAT_FRONT = HEAT.x + HEAT.width;

/** A varredura parte com bloco e frente inteiros à esquerda do touro, fora do recorte. */
const SWEEP_FROM = -Math.ceil(HEAT_FRONT + EDGE_WIDTH / 2 - BULL_BOUNDS.x);
const SWEEP_TRANSITION = { duration: 1.6, ease: EASE_OUT_EXPO, delay: 0.35 } as const;

/**
 * Mini emblema animado do cabeçalho (Torre + Touro, geometria compartilhada de geometry.ts).
 * Na carga, o gradiente de calor varre o touro da esquerda para a direita (transform dentro do recorte).
 * Decorativo (aria-hidden).
 */
export function NavEmblem({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ref = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${uid}-${name})`;

  return (
    <svg viewBox={EMBLEM_VIEWBOX} aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={ref("rook")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B3E94" />
          <stop offset="1" stopColor="#121A45" />
        </linearGradient>
        <linearGradient id={ref("heat")} gradientUnits="userSpaceOnUse" x1="80" y1="131" x2="80" y2="203">
          <stop offset="0" stopColor="#F59E0B" />
          <stop offset="0.55" stopColor="#EA580C" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
        <linearGradient id={ref("edge")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FBBF24" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFF4D6" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FBBF24" stopOpacity="0" />
        </linearGradient>
        <clipPath id={ref("rook-clip")}>
          <path d={ROOK_PATH} />
        </clipPath>
        <clipPath id={ref("bull-clip")}>
          <path d={BULL_PATH} />
        </clipPath>
      </defs>

      {/* Torre */}
      <path d={ROOK_PATH} fill={url("rook")} />

      <g clipPath={url("rook-clip")}>
        {/* Cavidade: o touro esculpido, ainda frio, antes de o calor chegar. */}
        <path d={BULL_PATH} fill="#070B1C" />
        <g clipPath={url("bull-clip")}>
          <motion.g initial={{ x: SWEEP_FROM }} animate={{ x: 0 }} transition={SWEEP_TRANSITION}>
            <rect x={HEAT.x} y={HEAT.y} width={HEAT.width} height={HEAT.height} fill={url("heat")} />
            <rect
              x={HEAT_FRONT - EDGE_WIDTH / 2}
              y={HEAT.y}
              width={EDGE_WIDTH}
              height={HEAT.height}
              fill={url("edge")}
            />
          </motion.g>
        </g>
      </g>

      {/* Contorno LED discreto. */}
      <path d={ROOK_PATH} fill="none" stroke="#F8FAFC" strokeOpacity={0.3} strokeWidth={6} strokeLinejoin="round" />
      <path d={ROOK_GROOVE_PATH} stroke="#F8FAFC" strokeOpacity={0.22} strokeWidth={4} />
    </svg>
  );
}
