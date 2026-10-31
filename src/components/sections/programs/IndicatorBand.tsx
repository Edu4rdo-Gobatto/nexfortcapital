"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { BAND_VIEW } from "./band";
import { BandCaption } from "./BandCaption";

/*
 * Linha de indicador do Finance Pro, no mesmo espaço da coroa da ITM (640 × 124) e com a mesma
 * linha de legenda reservada (BandCaption vazia), para que os painéis tenham a mesma altura.
 * Leitura: ruído → linha de decisão (LED) → degraus com método.
 * Desenho abstrato, sem eixos nem valores: não representa dados nem rentabilidade.
 */
const VIEW_W = BAND_VIEW.w;
const VIEW_H = BAND_VIEW.h;
const BASE = 112;
const RIGHT = 636;
const GATE_X = 240;
// Grade regular a cada 96: o ritmo de leitura dos indicadores.
const GRID_X = [32, 128, 224, 320, 416, 512, 608];

// Antes do método: oscilação que perde amplitude até a linha de decisão.
const NOISE =
  "M4 86 18 56 30 108 44 64 58 104 72 62 86 98 100 70 114 96 128 74 142 92 156 78 170 90 184 80 198 87 212 82 226 85 240 84";

// Depois do método: degraus ortogonais; cada trecho termina num ponto de decisão.
const STEPS = [
  { d: "M240 84H320", node: { x: 320, y: 84 } },
  { d: "M320 84V68H416", node: { x: 416, y: 68 } },
  { d: "M416 68V52H512", node: { x: 512, y: 52 } },
  { d: "M512 52V36H608", node: { x: 608, y: 36 } },
  { d: "M608 36V20H636", node: null },
] as const;

const NOISE_AT = 0.1;
const GATE_AT = 0.55;
const STEPS_AT = 0.85;
const STEP = 0.18;

type Cue = { at: number; duration: number; reduce: boolean };

const draw = {
  hidden: { pathLength: 0 },
  visible: ({ at, duration, reduce }: Cue) => ({
    pathLength: 1,
    transition: reduce ? { duration: 0 } : { delay: at, duration, ease: EASE_OUT_EXPO },
  }),
} satisfies Variants;

const reveal = {
  hidden: { opacity: 0 },
  visible: ({ at, duration, reduce }: Cue) => ({
    opacity: 1,
    transition: reduce ? { duration: 0 } : { delay: at, duration, ease: EASE_OUT_EXPO },
  }),
} satisfies Variants;

const diamond = (x: number, y: number, r: number) => `M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z`;

/** Painel de indicadores do Finance Pro. Decorativo (aria-hidden); desenha-se uma vez, ao entrar na tela. */
export function IndicatorBand({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion() === true; // só altera transições, nunca a marcação

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={cn("relative", className)}
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-auto w-full overflow-visible" focusable="false">
        {/* Zona estruturada (azul-real = estrutura): tudo o que vem depois da decisão. */}
        <motion.rect
          x={GATE_X}
          y={6}
          width={RIGHT - GATE_X}
          height={BASE - 6}
          fill="#3B55C4"
          fillOpacity={0.07}
          variants={reveal}
          custom={{ at: GATE_AT + 0.2, duration: 0.8, reduce }}
        />
        <g stroke="#F8FAFC" strokeOpacity={0.07}>
          {GRID_X.map((x) => (
            <path key={x} d={`M${x} 10V${BASE}`} />
          ))}
        </g>
        <path d={`M4 ${BASE}H${RIGHT}`} stroke="#F8FAFC" strokeOpacity={0.14} />

        <motion.path
          d={NOISE}
          fill="none"
          stroke="#94A3B8"
          strokeOpacity={0.65}
          strokeLinejoin="round"
          className="stroke-2 sm:stroke-[1.5]"
          variants={draw}
          custom={{ at: NOISE_AT, duration: 0.8, reduce }}
        />

        {/* Linha de decisão: o LED da fachada, agora na vertical. */}
        <g fill="none" stroke="#F8FAFC">
          <motion.path
            d={`M${GATE_X} 6V${BASE}`}
            strokeOpacity={0.16}
            className="stroke-7"
            variants={draw}
            custom={{ at: GATE_AT, duration: 0.5, reduce }}
          />
          <motion.path
            d={`M${GATE_X} 6V${BASE}`}
            className="stroke-[2.5] sm:stroke-2"
            variants={draw}
            custom={{ at: GATE_AT, duration: 0.5, reduce }}
          />
          {STEPS.map(({ d }, i) => (
            <motion.path
              key={`glow-${d}`}
              d={d}
              strokeOpacity={0.16}
              className="stroke-7"
              variants={draw}
              custom={{ at: STEPS_AT + i * STEP, duration: 0.45, reduce }}
            />
          ))}
          {STEPS.map(({ d }, i) => (
            <motion.path
              key={d}
              d={d}
              className="stroke-[2.5] sm:stroke-2"
              variants={draw}
              custom={{ at: STEPS_AT + i * STEP, duration: 0.45, reduce }}
            />
          ))}
        </g>

        {STEPS.map(({ node }, i) =>
          node ? (
            <motion.g key={`${node.x}-${node.y}`} variants={reveal} custom={{ at: STEPS_AT + i * STEP + 0.3, duration: 0.4, reduce }}>
              <path d={diamond(node.x, node.y, 11)} fill="#F59E0B" fillOpacity={0.16} />
              <path d={diamond(node.x, node.y, 5.5)} fill="#F59E0B" />
            </motion.g>
          ) : null,
        )}
      </svg>
      <BandCaption />
    </motion.div>
  );
}
