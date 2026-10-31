"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/animations";
import { cn } from "@/lib/utils";

/** A fita começa a acender logo depois que a fachada assenta na tela. */
const DRAW_DELAY = 0.2;
const DRAW_DURATION = 2.4;

/** Desenho do traço (pathLength). A opacidade esconde o ponto de partida antes do desenho. */
const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: "tween", duration: DRAW_DURATION, ease: EASE_OUT_EXPO, delay: DRAW_DELAY },
      opacity: { type: "tween", duration: 0.2, delay: DRAW_DELAY },
    },
  },
} satisfies Variants;

type FacadeStageProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Palco da fachada: dispara a sequência de luz uma única vez, quando a ilustração entra na tela.
 * Os filhos (SVG renderizado no servidor) herdam os rótulos "hidden" → "visible" por contexto.
 */
export function FacadeStage({ children, className }: FacadeStageProps) {
  // Traço e brilhos não são transform, então o reducedMotion="user" global não os alcança.
  // skipAnimations só muda como o Motion anima (nada no markup): sem divergência de hidratação.
  const reduceMotion = useReducedMotion();

  return (
    <MotionConfig skipAnimations={reduceMotion === true}>
      <motion.div
        aria-hidden="true"
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}

type LightFadeProps = {
  children: ReactNode;
  /** Atraso em relação ao início da sequência (s). */
  delay?: number;
  duration?: number;
};

/** Camada de luz (halo, reflexo, brilho) que acende em fade, só com opacity. */
export function LightFade({ children, delay = 0, duration = 1.6 }: LightFadeProps) {
  const variants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { type: "tween", duration, ease: EASE_OUT_EXPO, delay } },
  };

  return <motion.g variants={variants}>{children}</motion.g>;
}

/** Brilho interno, núcleo branco-quente e filete central: desenhados juntos, do pórtico à rampa. */
const LED_STROKES = [
  { color: "#FFE7C2", width: 9, opacity: 0.35 },
  { color: "#FFF4E0", width: 3.4, opacity: 1 },
  { color: "#FFFFFF", width: 1.2, opacity: 0.85 },
] as const;

/** Fita de LED da fachada (sem filtro: o desenho repinta só o traço). */
export function LedLine({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinejoin="miter">
      {LED_STROKES.map((stroke) => (
        <motion.path
          key={stroke.width}
          d={d}
          stroke={stroke.color}
          strokeWidth={stroke.width}
          strokeOpacity={stroke.opacity}
          variants={draw}
        />
      ))}
    </g>
  );
}

type LedRailProps = {
  /** Lado do botão em que o trilho fica: ele acende a partir do botão para fora. */
  side: "left" | "right";
  className?: string;
};

/** Trilho de LED que corre até o botão de WhatsApp. Anima só scaleX e opacity. */
export function LedRail({ side, className }: LedRailProps) {
  const toward = side === "left" ? "bg-linear-to-r" : "bg-linear-to-l";

  return (
    <span aria-hidden="true" className={cn("pointer-events-none relative block h-px", className)}>
      <motion.span
        className={cn("absolute inset-0", side === "left" ? "origin-right" : "origin-left")}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "tween", duration: 1.2, ease: EASE_OUT_EXPO, delay: 0.25 }}
      >
        <span className={cn("absolute inset-0 from-transparent to-[#FFF4E0]", toward)} />
        {/* Brilho como cópia desfocada: acompanha o degradê (um box-shadow brilharia até na ponta apagada). */}
        <span className={cn("absolute inset-x-0 -top-px h-0.75 from-transparent to-[#FFE7C2]/80 blur-[3px]", toward)} />
      </motion.span>
    </span>
  );
}
