"use client";

import { motion, useTransform, type MotionValue, type Variants } from "motion/react";
import { BULL_BOUNDS, BULL_PATH, EMBLEM_VIEWBOX, ROOK_PATH } from "@/components/brand/geometry";
import { EASE_OUT_EXPO } from "@/lib/animations";
import {
  BULL_CENTER,
  PARTICLES,
  PARTICLE_ALPHA,
  SWEEP,
  TIMELINE,
  type Particle,
  type Step,
} from "./constants";
import { SOFT_FADE, fadeIn, stepFor } from "./presets";

/** Onda de calor: o grupo (preenchimento + frente quente) atravessa o recorte do touro da esquerda para a direita. */
const heatSweep = {
  hidden: { x: SWEEP.from },
  drawn: ({ delay, duration }: Step) => ({
    x: 0,
    transition: { delay, duration, ease: EASE_OUT_EXPO },
  }),
} satisfies Variants;

/** Clarão de ignição: acende e se dissipa (termina invisível, então o estado reduzido é o mesmo). */
const ignitionBurst = {
  hidden: { opacity: 0, scale: 0.55 },
  drawn: ({ delay, duration }: Step) => ({
    opacity: [0, 1, 0],
    scale: [0.55, 1.15, 1.35],
    transition: { delay, duration, ease: EASE_OUT_EXPO, times: [0, 0.28, 1] },
  }),
} satisfies Variants;

const BULL_CENTER_STYLE = { left: BULL_CENTER.left, top: BULL_CENTER.top } as const;

/** Envelope de opacidade de uma partícula ao longo do ciclo (0–1): entra, sustenta, apaga. */
function envelope(progress: number) {
  if (progress < 0.18) return progress / 0.18;
  if (progress > 0.68) return (1 - progress) / 0.32;
  return 1;
}

/** Micro candlestick de alta: corpo + pavio, subindo em loop (translateY + opacidade). */
function RisingCandle({ particle, clock }: { particle: Particle; clock: MotionValue<number> }) {
  const progressAt = (t: number) => (t / particle.duration + particle.phase) % 1;
  const y = useTransform(clock, (t) => -particle.rise * progressAt(t));
  const opacity = useTransform(clock, (t) => envelope(progressAt(t)) * PARTICLE_ALPHA[particle.tone]);
  const color = particle.tone === "green" ? "#34D399" : "#F59E0B";
  const top = particle.y - particle.body;

  return (
    <motion.g style={{ y, opacity }}>
      <line x1={particle.x} x2={particle.x} y1={top - 2.2} y2={particle.y + 1.8} stroke={color} strokeWidth="0.45" />
      <rect x={particle.x - 1.1} y={top} width="2.2" height={particle.body} fill={color} />
    </motion.g>
  );
}

type BullLayerProps = {
  uid: string;
  reduce: boolean | null;
  /** A ignição terminou: partículas e cards podem entrar. */
  ignited: boolean;
  /** Relógio das partículas (s), avançado pelo laço de quadros do componente. */
  clock: MotionValue<number>;
  onIgnite: () => void;
};

/**
 * Camada do touro (multiplicação, energia). SVG próprio, recortado por ROOK_PATH, numa camada HTML
 * separada da torre para receber a paralaxe e a rotação 3D do ponteiro.
 */
export function BullLayer({ uid, reduce, ignited, clock, onIgnite }: BullLayerProps) {
  const rookClip = `${uid}-bull-rook`;
  const shapeClip = `${uid}-bull-shape`;
  const heatId = `${uid}-bull-heat`;
  const frontId = `${uid}-bull-front`;
  const sheenId = `${uid}-bull-sheen`;

  return (
    <>
      {/* Brilho dourado atrás do touro (gradiente radial: só a opacidade anima). */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute size-[96%] -translate-x-1/2 -translate-y-1/2"
        style={BULL_CENTER_STYLE}
        variants={fadeIn}
        custom={stepFor(TIMELINE.glow, reduce)}
      >
        <div className="size-full bg-[radial-gradient(closest-side,rgb(245_158_11/0.4),rgb(234_88_12/0.16)_52%,transparent)] opacity-60" />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute size-[70%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(255_241_201/0.75),rgb(245_158_11/0.3)_45%,transparent)]"
        style={BULL_CENTER_STYLE}
        variants={ignitionBurst}
        custom={stepFor(TIMELINE.burst, reduce)}
      />

      <svg
        viewBox={EMBLEM_VIEWBOX}
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <clipPath id={rookClip}>
            <path d={ROOK_PATH} />
          </clipPath>
          <clipPath id={shapeClip}>
            <path d={BULL_PATH} />
          </clipPath>
          <linearGradient
            id={heatId}
            gradientUnits="userSpaceOnUse"
            x1="80"
            y1={BULL_BOUNDS.y}
            x2="80"
            y2={BULL_BOUNDS.y + BULL_BOUNDS.height}
          >
            <stop offset="0" stopColor="#F59E0B" />
            <stop offset="0.55" stopColor="#EA580C" />
            <stop offset="1" stopColor="#B91C1C" />
          </linearGradient>
          <linearGradient id={frontId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFF4D6" />
            <stop offset="0.3" stopColor="#FBBF24" stopOpacity="0.9" />
            <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
          {/* Luz de cima sobre o dorso: dá volume de escultura sem redesenhar a silhueta. */}
          <linearGradient
            id={sheenId}
            gradientUnits="userSpaceOnUse"
            x1="80"
            y1={BULL_BOUNDS.y}
            x2="80"
            y2={BULL_BOUNDS.y + 26}
          >
            <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.34" />
            <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g clipPath={`url(#${rookClip})`}>
          {/* Mercado em alta: micro candles nascem atrás do touro e sobem pela coluna. */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: ignited && reduce === false ? 1 : 0 }}
            transition={SOFT_FADE}
          >
            {PARTICLES.map((particle) => (
              <RisingCandle key={`${particle.x}-${particle.y}`} particle={particle} clock={clock} />
            ))}
          </motion.g>

          <g clipPath={`url(#${shapeClip})`}>
            <motion.g
              variants={heatSweep}
              custom={stepFor(TIMELINE.ignite, reduce)}
              onAnimationComplete={(definition) => {
                if (definition === "drawn") onIgnite();
              }}
            >
              <rect x={SWEEP.fillX} y={SWEEP.y} width={SWEEP.fillWidth} height={SWEEP.height} fill={`url(#${heatId})`} />
              <rect x={SWEEP.fillX} y={SWEEP.y} width={SWEEP.fillWidth} height="30" fill={`url(#${sheenId})`} />
              <rect x={SWEEP.frontX} y={SWEEP.y} width={SWEEP.frontWidth} height={SWEEP.height} fill={`url(#${frontId})`} />
            </motion.g>
          </g>
        </g>
      </svg>
    </>
  );
}
