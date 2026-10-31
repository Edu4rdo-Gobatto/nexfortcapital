"use client";

import { motion, type Variants } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** Geometria da fita de LED da fachada: desce a 32° (mesmo ângulo da rampa da sede). */
const DROP = 56; // px de descida
const ANGLE = 32;
const RUN = DROP / Math.tan((ANGLE * Math.PI) / 180); // ≈ 89.6px de percurso horizontal
const DIAGONAL = Math.hypot(DROP, RUN); // ≈ 105.6px

const GLOW = "shadow-[0_0_10px_rgb(248_250_252/0.5),0_0_2px_rgb(248_250_252/0.9)]";

const segment = (delay: number): Variants => ({
  hidden: { scaleX: 0, opacity: 0 },
  visible: { scaleX: 1, opacity: 1, transition: { duration: 0.7, ease: EASE_OUT_EXPO, delay } },
});

type LedDividerProps = {
  className?: string;
  /** Onde a linha horizontal "quebra" na diagonal (valor CSS de left). */
  breakAt?: string;
  /** Espelha horizontalmente (diagonal descendo da direita para a esquerda). */
  flip?: boolean;
};

/**
 * Divisor de seção assinatura: linha de LED horizontal → corte diagonal a 32° → linha horizontal.
 * Desenha-se ao entrar na tela (scaleX + opacity). A diagonal fica num invólucro já rotacionado,
 * para que o scale aconteça no eixo da própria linha.
 */
export function LedDivider({ className, breakAt = "22%", flip = false }: LedDividerProps) {
  return (
    <motion.div
      aria-hidden="true"
      className={cn("pointer-events-none relative w-full", flip && "-scale-x-100", className)}
      style={{ height: DROP + 1 }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.6 }}
    >
      <motion.span
        className={cn("absolute top-0 left-0 h-px origin-left bg-linear-to-r from-transparent to-led/90", GLOW)}
        style={{ width: breakAt }}
        variants={segment(0)}
      />
      <span className="absolute top-0 h-px origin-left rotate-[32deg]" style={{ left: breakAt, width: DIAGONAL }}>
        <motion.span className={cn("absolute inset-0 origin-left bg-led/90", GLOW)} variants={segment(0.45)} />
      </span>
      <motion.span
        className={cn("absolute right-0 h-px origin-left bg-linear-to-r from-led/90 via-led/40 to-transparent", GLOW)}
        style={{ top: DROP, left: `calc(${breakAt} + ${RUN.toFixed(1)}px)` }}
        variants={segment(0.75)}
      />
    </motion.div>
  );
}
