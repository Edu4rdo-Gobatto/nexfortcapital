"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { SPRING_SMOOTH } from "@/lib/animations";

/**
 * Configuração global do Motion: respeita `prefers-reduced-motion` do sistema
 * (transforms viram instantâneos) e usa a mola padrão do projeto quando nada for definido.
 * Obs.: não alcança `useSpring` — componentes com física de ponteiro checam useReducedMotion().
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={SPRING_SMOOTH}>
      {children}
    </MotionConfig>
  );
}
