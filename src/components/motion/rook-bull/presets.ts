"use client";

// Variantes e transições compartilhadas pelas camadas do emblema. Os rótulos "hidden" → "drawn"
// vêm do palco (RookBullCenterpiece); cada filho recebe a sua etapa da linha do tempo via `custom`.
import type { Transition, Variants } from "motion/react";
import { EASE_OUT_EXPO, SPRING_SMOOTH } from "@/lib/animations";
import { INSTANT, type Step } from "./constants";

/** Resposta de opacidade às trocas de modo (tween com a curva do projeto, sem overshoot). */
export const MODE_FADE = { duration: 0.55, ease: EASE_OUT_EXPO } as const satisfies Transition;

/** Escala com a mola padrão; opacidade com a curva de saída. */
export const MODE_SHIFT = { ...SPRING_SMOOTH, opacity: MODE_FADE } as const satisfies Transition;

/** Com movimento reduzido, toda etapa vira instantânea (estado final composto de imediato). */
export function stepFor(step: Step, reduce: boolean | null): Step {
  return reduce ? INSTANT : step;
}

/** Traço arquitetônico desenhado via pathLength (stroke-dashoffset). */
export const drawStroke = {
  hidden: { pathLength: 0, opacity: 0 },
  drawn: ({ delay, duration }: Step) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay, duration, ease: EASE_OUT_EXPO },
      opacity: { delay, duration: Math.min(duration, 0.2) },
    },
  }),
} satisfies Variants;

/** Aparição por opacidade (preenchimento da torre, halos, gráfico). */
export const fadeIn = {
  hidden: { opacity: 0 },
  drawn: ({ delay, duration }: Step) => ({
    opacity: 1,
    transition: { delay, duration, ease: EASE_OUT_EXPO },
  }),
} satisfies Variants;

/** Linha de LED do piso: abre do centro para fora. */
export const openLine = {
  hidden: { scaleX: 0, opacity: 0 },
  drawn: ({ delay, duration }: Step) => ({
    scaleX: 1,
    opacity: 1,
    transition: { delay, duration, ease: EASE_OUT_EXPO },
  }),
} satisfies Variants;
