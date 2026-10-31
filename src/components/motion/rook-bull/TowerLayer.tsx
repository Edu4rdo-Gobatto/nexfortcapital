"use client";

import { motion } from "motion/react";
import { BULL_PATH, EMBLEM_VIEWBOX, ROOK_GROOVE_PATH, ROOK_PATH, ROOK_STROKES } from "@/components/brand/geometry";
import { DETAIL_STAGGER, TIMELINE, type Step, type VisualMode } from "./constants";
import { MODE_FADE, drawStroke, fadeIn, stepFor } from "./presets";

/** Trechos sob o colar que ROOK_STROKES não percorre: fecham o contorno entre o colar e a coluna. */
const COLLAR_UNDERSIDE = ["M32 44H22", "M128 44H138"] as const;

type Stroke = { readonly d: string; readonly step: Step };

/** Contorno na ordem de construção: ameias → colunas → base. */
const OUTLINE: readonly Stroke[] = [
  { d: ROOK_STROKES.battlement, step: TIMELINE.battlement },
  { d: COLLAR_UNDERSIDE[0], step: TIMELINE.collar },
  { d: COLLAR_UNDERSIDE[1], step: TIMELINE.collar },
  { d: ROOK_STROKES.columnLeft, step: TIMELINE.columns },
  { d: ROOK_STROKES.columnRight, step: TIMELINE.columns },
  { d: ROOK_STROKES.base, step: TIMELINE.base },
];

/** Juntas internas (colar, pescoço, plinto), por último. */
const DETAILS: readonly Stroke[] = ROOK_STROKES.details.map((d, i) => ({
  d,
  step: { delay: TIMELINE.details.delay + i * DETAIL_STAGGER, duration: TIMELINE.details.duration },
}));

/** Silhueta da torre como máscara da textura de concreto (camada HTML estática). */
const ROOK_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${EMBLEM_VIEWBOX}" preserveAspectRatio="none"><path d="${ROOK_PATH}"/></svg>`,
)}")`;

const ROOK_MASK_STYLE = {
  maskImage: ROOK_MASK,
  WebkitMaskImage: ROOK_MASK,
  maskSize: "100% 100%",
  WebkitMaskSize: "100% 100%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
} as const;

type TowerLayerProps = {
  /** Prefixo de ids SVG já higienizado. */
  uid: string;
  mode: VisualMode;
  reduce: boolean | null;
};

/**
 * Camada da torre (governança, proteção, estratégia). Herda os rótulos "hidden"/"drawn" do palco:
 * desenha o contorno em ordem de construção, depois acende o preenchimento azul-marinho.
 */
export function TowerLayer({ uid, mode, reduce }: TowerLayerProps) {
  const fillId = `${uid}-tower-fill`;
  const shadeId = `${uid}-tower-shade`;
  const clipId = `${uid}-tower-clip`;
  const glowId = `${uid}-tower-glow`;
  const ledId = `${uid}-tower-led`;
  const fill = stepFor(TIMELINE.fill, reduce);

  return (
    <>
      {/* Volume: gradiente azul-marinho, sombreamento lateral e o nicho escuro onde o touro está esculpido. */}
      <svg
        viewBox={EMBLEM_VIEWBOX}
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2B3E94" />
            <stop offset="1" stopColor="#121A45" />
          </linearGradient>
          <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#F8FAFC" stopOpacity="0.1" />
            <stop offset="0.36" stopColor="#F8FAFC" stopOpacity="0" />
            <stop offset="0.62" stopColor="#060913" stopOpacity="0" />
            <stop offset="1" stopColor="#060913" stopOpacity="0.42" />
          </linearGradient>
          <clipPath id={clipId}>
            <path d={ROOK_PATH} />
          </clipPath>
        </defs>
        <motion.g variants={fadeIn} custom={fill}>
          <path d={ROOK_PATH} fill={`url(#${fillId})`} />
          <g clipPath={`url(#${clipId})`}>
            <rect width="160" height="240" fill={`url(#${shadeId})`} />
            <path d={BULL_PATH} fill="#04071A" fillOpacity="0.92" />
          </g>
        </motion.g>
      </svg>

      {/* Grão de concreto recortado na silhueta (imagem estática, sem custo por quadro). */}
      <motion.div
        aria-hidden="true"
        className="concrete-noise absolute inset-0"
        style={ROOK_MASK_STYLE}
        variants={fadeIn}
        custom={fill}
      />

      {/* Linhas arquitetônicas: brilho suave em royal + traço nítido em royal-glow, desenhados juntos. */}
      <svg
        viewBox={EMBLEM_VIEWBOX}
        className="absolute inset-0 size-full overflow-visible"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          {/* userSpaceOnUse: linhas retas têm caixa de altura zero e sumiriam com a região padrão do filtro. */}
          <filter id={glowId} filterUnits="userSpaceOnUse" x="-12" y="-12" width="184" height="264">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
          <filter id={ledId} filterUnits="userSpaceOnUse" x="-12" y="-12" width="184" height="264">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
        </defs>

        <g filter={`url(#${glowId})`} fill="none" stroke="#1E2D6B" strokeWidth="4.2" strokeLinejoin="round">
          {OUTLINE.map((stroke) => (
            <motion.path key={stroke.d} d={stroke.d} variants={drawStroke} custom={stepFor(stroke.step, reduce)} />
          ))}
        </g>
        <g fill="none" stroke="#3B55C4" strokeWidth="1.15" strokeLinejoin="round">
          {OUTLINE.map((stroke) => (
            <motion.path key={stroke.d} d={stroke.d} variants={drawStroke} custom={stepFor(stroke.step, reduce)} />
          ))}
        </g>
        <g fill="none" stroke="#3B55C4" strokeOpacity="0.75" strokeWidth="0.6">
          {DETAILS.map((stroke) => (
            <motion.path key={stroke.d} d={stroke.d} variants={drawStroke} custom={stepFor(stroke.step, reduce)} />
          ))}
        </g>

        {/* Modo Torre: a estrutura acende (brilho royal mais forte sobre o contorno e as juntas). */}
        <motion.g
          fill="none"
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: mode === "tower" ? 1 : 0 }}
          transition={MODE_FADE}
        >
          <path d={ROOK_PATH} stroke="#3B55C4" strokeWidth="3.6" filter={`url(#${glowId})`} />
          <path d={ROOK_PATH} stroke="#8EA2FF" strokeWidth="0.9" />
          {ROOK_STROKES.details.map((d) => (
            <path key={d} d={d} stroke="#6F86F0" strokeWidth="0.6" />
          ))}
        </motion.g>

        {/* Friso de LED sob o colar: a mesma luz branca da fachada. */}
        <motion.path
          d={ROOK_GROOVE_PATH}
          fill="none"
          stroke="#F8FAFC"
          strokeOpacity="0.55"
          strokeWidth="2.2"
          filter={`url(#${ledId})`}
          variants={drawStroke}
          custom={stepFor(TIMELINE.groove, reduce)}
        />
        <motion.path
          d={ROOK_GROOVE_PATH}
          fill="none"
          stroke="#F8FAFC"
          strokeWidth="0.7"
          variants={drawStroke}
          custom={stepFor(TIMELINE.groove, reduce)}
        />
      </svg>
    </>
  );
}
