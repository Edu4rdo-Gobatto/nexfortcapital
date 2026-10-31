"use client";

import { useId, useRef } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { BAND_INSET, BAND_VIEW, NEXT_EDITION } from "./band";
import { BandCaption } from "./BandCaption";
import { WithNumerals } from "./numerals";

/*
 * A coroa da torre do emblema esticada na horizontal (proporções de ROOK_PATH): bloco de ameias,
 * colar arredondado e gargalo com o friso de luz. Cada merlão é uma edição realizada; o último,
 * tracejado em ouro, é a próxima. Espaço de desenho: 640 × 124.
 */
const VIEW_W = BAND_VIEW.w;
const VIEW_H = BAND_VIEW.h;
const COLLAR_L = 4;
const COLLAR_R = 636;
const BLOCK_L = BAND_INSET; // o colar avança além do bloco das ameias, como na torre
const BLOCK_R = VIEW_W - BAND_INSET;
const NECK_L = 30;
const NECK_R = 610;
const TOP = 12; // topo dos merlões
const SEAT = 58; // fundo das ameias, onde os merlões nascem
const BLOCK_B = 82; // base do bloco = topo do colar
const COLLAR_B = 100; // base do colar
const GROOVE = 111; // friso de luz no gargalo (ROOK_GROOVE_PATH)
const CRENEL_RATIO = 40 / 56; // ameia : merlão
const COLLAR_RADIUS = (COLLAR_B - BLOCK_B) / 2;

// Coreografia: o LED percorre as ameias e cada merlão acende quando ele passa; no fim o friso se acende.
const START = 0.15;
const STEP = 0.2;
const SEGMENT = 0.55;

type Cue = { at: number; duration: number; reduce: boolean };

const draw = {
  hidden: { pathLength: 0 },
  visible: ({ at, duration, reduce }: Cue) => ({
    pathLength: 1,
    transition: reduce ? { duration: 0 } : { delay: at, duration, ease: EASE_OUT_EXPO },
  }),
} satisfies Variants;

const light = {
  hidden: { opacity: 0 },
  visible: ({ at, duration, reduce }: Cue) => ({
    opacity: 1,
    transition: reduce ? { duration: 0 } : { delay: at, duration, ease: EASE_OUT_EXPO },
  }),
} satisfies Variants;

const round = (n: number) => Math.round(n * 100) / 100;
const percent = (n: number, total: number) => `${round((n / total) * 100)}%`;

const COLLAR =
  `M${COLLAR_L + COLLAR_RADIUS} ${BLOCK_B}H${COLLAR_R - COLLAR_RADIUS}` +
  `Q${COLLAR_R} ${BLOCK_B} ${COLLAR_R} ${BLOCK_B + COLLAR_RADIUS}Q${COLLAR_R} ${COLLAR_B} ${COLLAR_R - COLLAR_RADIUS} ${COLLAR_B}` +
  `H${COLLAR_L + COLLAR_RADIUS}` +
  `Q${COLLAR_L} ${COLLAR_B} ${COLLAR_L} ${BLOCK_B + COLLAR_RADIUS}Q${COLLAR_L} ${BLOCK_B} ${COLLAR_L + COLLAR_RADIUS} ${BLOCK_B}Z`;

function crown(editions: number) {
  const slots = editions + 1; // edições realizadas + a próxima
  const merlon = (BLOCK_R - BLOCK_L) / (slots + (slots - 1) * CRENEL_RATIO);
  const pitch = merlon * (1 + CRENEL_RATIO);
  const starts = Array.from({ length: slots }, (_, i) => round(BLOCK_L + i * pitch));
  const built = starts.slice(0, editions);
  const next = starts[editions];

  return {
    built,
    next,
    width: round(merlon),
    // Um trecho de LED por edição: sobe, cruza o merlão, desce e atravessa a ameia seguinte.
    segments: built.map(
      (x, i) => `M${x} ${i === 0 ? BLOCK_B : SEAT}V${TOP}H${round(x + merlon)}V${SEAT}H${starts[i + 1]}`,
    ),
    // Bloco das ameias com os merlões erguidos; o da próxima edição fica vazado.
    block:
      `M${BLOCK_L} ${BLOCK_B}V${TOP}` +
      built.map((x, i) => `${i === 0 ? "" : `H${x}V${TOP}`}H${round(x + merlon)}V${SEAT}`).join("") +
      `H${BLOCK_R}V${BLOCK_B}Z`,
  };
}

type EditionsBandProps = {
  editions: number;
  /** Nome acessível da lista de edições. */
  label: string;
  /** Legenda sob a coroa, alinhada à esquerda (ex.: "1ª à 6ª Edição consolidada"). */
  caption: string;
  className?: string;
};

/**
 * Linha do tempo da ITM desenhada como a coroa da torre. A lista de edições é HTML real,
 * posicionada sobre o desenho; o SVG é decorativo. Desenha-se uma vez, ao entrar na tela.
 * A legenda (BandCaption) tem a mesma altura da linha reservada na IndicatorBand.
 */
export function EditionsBand({ editions, label, caption, className }: EditionsBandProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion() === true; // só altera transições, nunca a marcação
  const { built, next, width, segments, block } = crown(editions);
  const finale = START + editions * STEP;
  const ids = { stone: `${uid}-stone`, lit: `${uid}-lit`, collar: `${uid}-collar`, neck: `${uid}-neck` };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={cn("relative", className)}
    >
      <div className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="block h-auto w-full overflow-visible"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id={ids.stone} gradientUnits="userSpaceOnUse" x1="0" y1={TOP} x2="0" y2={BLOCK_B}>
              <stop offset="0" stopColor="#1A275E" />
              <stop offset="1" stopColor="#0E1640" />
            </linearGradient>
            {/* Mesmos tons da torre do emblema (#2B3E94 → #121A45). */}
            <linearGradient id={ids.lit} gradientUnits="userSpaceOnUse" x1="0" y1={TOP} x2="0" y2={SEAT}>
              <stop offset="0" stopColor="#2B3E94" />
              <stop offset="1" stopColor="#1B2867" />
            </linearGradient>
            <linearGradient id={ids.collar} gradientUnits="userSpaceOnUse" x1="0" y1={BLOCK_B} x2="0" y2={COLLAR_B}>
              <stop offset="0" stopColor="#1D2B68" />
              <stop offset="1" stopColor="#111A45" />
            </linearGradient>
            <linearGradient id={ids.neck} gradientUnits="userSpaceOnUse" x1="0" y1={COLLAR_B} x2="0" y2={VIEW_H}>
              <stop offset="0" stopColor="#121A45" />
              <stop offset="1" stopColor="#121A45" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Gargalo: some para baixo, como se a torre continuasse. */}
          <rect x={NECK_L} y={COLLAR_B} width={NECK_R - NECK_L} height={VIEW_H - COLLAR_B} fill={`url(#${ids.neck})`} />
          <path d={block} fill={`url(#${ids.stone})`} />
          {built.map((x, i) => (
            <motion.rect
              key={x}
              x={x}
              y={TOP}
              width={width}
              height={SEAT - TOP}
              fill={`url(#${ids.lit})`}
              variants={light}
              custom={{ at: START + i * STEP + 0.12, duration: 0.7, reduce }}
            />
          ))}
          <path d={COLLAR} fill={`url(#${ids.collar})`} />
          <path
            d={`M${COLLAR_L + COLLAR_RADIUS} ${BLOCK_B}H${COLLAR_R - COLLAR_RADIUS}`}
            stroke="#F8FAFC"
            strokeOpacity={0.22}
          />
          <path d={`M${next} ${SEAT}H${BLOCK_R}V${BLOCK_B}`} fill="none" stroke="#F8FAFC" strokeOpacity={0.14} />

          {/* A próxima edição: o merlão que ainda vai ser erguido. */}
          <motion.path
            d={`M${next} ${SEAT}V${TOP}H${BLOCK_R}V${SEAT}`}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            variants={light}
            custom={{ at: finale + 0.25, duration: 0.6, reduce }}
          />

          <g fill="none" stroke="#F8FAFC">
            {/* Friso de luz do gargalo: acende por último, de ponta a ponta. */}
            <motion.path
              d={`M${NECK_L + 8} ${GROOVE}H${NECK_R - 8}`}
              strokeOpacity={0.42}
              strokeWidth={1.25}
              variants={draw}
              custom={{ at: finale - 0.2, duration: 1, reduce }}
            />
            {segments.map((d, i) => (
              <motion.path
                key={`glow-${d}`}
                d={d}
                strokeOpacity={0.16}
                className="stroke-7"
                variants={draw}
                custom={{ at: START + i * STEP, duration: SEGMENT, reduce }}
              />
            ))}
            {segments.map((d, i) => (
              <motion.path
                key={d}
                d={d}
                className="stroke-[2.5] sm:stroke-2"
                variants={draw}
                custom={{ at: START + i * STEP, duration: SEGMENT, reduce }}
              />
            ))}
          </g>
        </svg>

        <ol aria-label={label} className="absolute inset-0">
          {built.map((x, i) => (
            <li
              key={x}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[0.6875rem] leading-none font-medium text-led sm:text-sm"
              style={{ left: percent(x + width / 2, VIEW_W), top: percent((TOP + SEAT) / 2, VIEW_H) }}
            >
              <WithNumerals text={`${i + 1}ª`} />
              <span className="sr-only"> edição</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Legenda: à esquerda o que já foi feito, à direita (sob o merlão tracejado) o que vem. */}
      <BandCaption caption={caption} aside={NEXT_EDITION} />
    </motion.div>
  );
}
