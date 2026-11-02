// Sem "use client": constantes puras. Importe a partir de componentes "use client"
// (stagger() devolve uma função, que não atravessa a fronteira Server → Client).
import { stagger, type Transition, type Variants } from "motion/react";

/** cubic-bezier(0.22, 1, 0.36, 1): o mesmo desenho de power4.out do GSAP. Precisa ser readonly. */
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

/** Mola padrão do projeto (CLAUDE.md). `type: 'spring'` é obrigatório: sem ele o Motion faz um tween de 0.3s. */
export const SPRING_SMOOTH = { type: "spring", stiffness: 300, damping: 30, mass: 1 } as const satisfies Transition;

/** Entrada padrão: sobe com mola; a opacidade usa a curva de saída para não "quicar". */
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...SPRING_SMOOTH, opacity: { duration: 0.6, ease: EASE_OUT_EXPO } },
  },
} satisfies Variants;

/** Orquestra filhos com `hidden`/`visible`. (`staggerChildren` está depreciado no Motion 14.) */
export const staggerContainer = {
  hidden: {},
  visible: { transition: { delayChildren: stagger(0.08) } },
} satisfies Variants;
