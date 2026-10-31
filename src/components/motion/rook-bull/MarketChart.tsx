"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import { CHART_CANDLES, CHART_HEIGHT, CHART_LINE, CHART_PERIOD, TIMELINE, type VisualMode } from "./constants";
import { MODE_FADE, fadeIn, stepFor } from "./presets";

/** Esmaece as bordas da faixa (máscara estática, sem custo de animação). */
const CHART_MASK = "radial-gradient(closest-side, #000 52%, transparent)";
const CHART_MASK_STYLE = { maskImage: CHART_MASK, WebkitMaskImage: CHART_MASK } as const;

type CandleShape = { cx: number; high: number; low: number; top: number; height: number };

/** Geometria dos candles calculada uma vez no módulo (arredondada: markup curto e idêntico no SSR). */
const CANDLE_SHAPES = CHART_CANDLES.map(([cx, open, close, high, low]) => ({
  rising: close < open,
  shape: {
    cx,
    high,
    low,
    top: Math.min(open, close),
    height: Math.max(Math.round(Math.abs(close - open) * 10) / 10, 0.8),
  },
}));
const RISING = CANDLE_SHAPES.filter((candle) => candle.rising).map((candle) => candle.shape);
const FALLING = CANDLE_SHAPES.filter((candle) => !candle.rising).map((candle) => candle.shape);

function Candles({ shapes }: { shapes: readonly CandleShape[] }) {
  return shapes.map(({ cx, high, low, top, height }) => (
    <g key={cx}>
      <line x1={cx} x2={cx} y1={high} y2={low} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <rect x={cx - 1.6} y={top} width="3.2" height={height} stroke="none" />
    </g>
  ));
}

type MarketChartProps = {
  uid: string;
  /** Progresso do laço (0–1): 1 ciclo = metade da faixa, que tem duas cópias idênticas. */
  progress: MotionValue<number>;
  mode: VisualMode;
  reduce: boolean | null;
};

/** Gráfico de mercado tênue atrás do emblema, rolando na horizontal em laço contínuo (só transform). */
export function MarketChart({ uid, progress, mode, reduce }: MarketChartProps) {
  const x = useTransform(progress, (value) => `${value * -50}%`);
  const bullMode = mode === "bull";
  const candlesId = `${uid}-chart-candles`;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-[37%] aspect-288/120 overflow-hidden"
      style={CHART_MASK_STYLE}
      variants={fadeIn}
      custom={stepFor(TIMELINE.chart, reduce)}
    >
      <motion.div className="h-full w-[200%] opacity-60 motion-safe:will-change-transform" style={{ x }}>
        <svg
          viewBox={`0 0 ${CHART_PERIOD * 2} ${CHART_HEIGHT}`}
          className="block size-full overflow-visible"
          focusable="false"
        >
          {/* Um ciclo desenhado uma vez; o segundo é um <use> deslocado (laço sem emenda). */}
          <g id={candlesId}>
            <g fill="#34D399" stroke="#34D399" opacity="0.55">
              <Candles shapes={RISING} />
            </g>
            <g fill="#94A3B8" stroke="#94A3B8" opacity="0.4">
              <Candles shapes={FALLING} />
            </g>
          </g>
          <use href={`#${candlesId}`} x={CHART_PERIOD} />
          <motion.path
            d={CHART_LINE}
            fill="none"
            stroke="#3B55C4"
            strokeWidth="1.25"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: bullMode ? 0 : 0.9 }}
            transition={MODE_FADE}
          />
          <motion.path
            d={CHART_LINE}
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.25"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: bullMode ? 0.95 : 0 }}
            transition={MODE_FADE}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
