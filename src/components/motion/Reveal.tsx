"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

const MOTION_TAGS = {
  div: motion.div,
  p: motion.p,
  li: motion.li,
  span: motion.span,
  article: motion.article,
} as const;

type RevealProps = {
  children: ReactNode;
  as?: keyof typeof MOTION_TAGS;
  className?: string;
  /** Atraso da entrada (s). */
  delay?: number;
  /**
   * "view" (padrão): Motion, ao entrar na tela. "load": keyframes CSS que começam no primeiro paint,
   * sem esperar a hidratação. Use "load" no conteúdo acima da dobra (LCP).
   */
  trigger?: "view" | "load";
};

/**
 * Entrada padrão (fadeInUp), uma única vez.
 * Permite que seções Server Component animem conteúdo sem virarem client components.
 */
export function Reveal({ children, as = "div", className, delay = 0, trigger = "view" }: RevealProps) {
  if (trigger === "load") {
    const Tag = as;
    return (
      <Tag className={cn("motion-safe:animate-fade-up", className)} style={{ "--nx-delay": `${delay}s` } as CSSProperties}>
        {children}
      </Tag>
    );
  }

  const MotionTag = MOTION_TAGS[as];
  const transition = fadeInUp.visible.transition;
  // A opacidade tem transição própria: o atraso precisa ir nos dois níveis, senão ela começa antes do y.
  const variants: Variants = delay
    ? {
        ...fadeInUp,
        visible: { ...fadeInUp.visible, transition: { ...transition, delay, opacity: { ...transition.opacity, delay } } },
      }
    : fadeInUp;

  return (
    <MotionTag
      data-reveal=""
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {children}
    </MotionTag>
  );
}
