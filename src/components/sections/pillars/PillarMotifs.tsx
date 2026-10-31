import { useId } from "react";
import { BULL_PATH, ROOK_GROOVE_PATH, ROOK_PATH, ROOK_STROKES } from "@/components/brand/geometry";
import { cn } from "@/lib/utils";

/*
 * Motivos dos pilares, desenhados como pranchas de arquitetura a partir do emblema:
 * a coroa da Torre (empresas: estrutura e governança), o escudo equilibrado (família: orçamento e reservas)
 * e o Touro (investimentos: multiplicação). Azul = estrutura; gradiente de calor = multiplicação.
 * Traços com vector-effect non-scaling-stroke: o filete continua fino em qualquer escala.
 * Decorativos (aria-hidden). Reagem ao hover do TiltCard via `group-hover/tilt` (só opacity/translate).
 */

const LED = "#F8FAFC";
const ROYAL_GLOW = "#3B55C4";
const HAIRLINE = { vectorEffect: "non-scaling-stroke", fill: "none" } as const;

type MotifProps = { className?: string };

/** IDs únicos por instância para gradientes e máscaras. */
function useSvgIds(...names: string[]) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return names.map((name) => `${uid}-${name}`);
}

/** Linhas de DRE dentro da torre: rubrica à esquerda, valor alinhado à direita (o eixo passa entre elas). */
const LEDGER_ROWS = [
  { y: 66, labelEnd: 70, valueStart: 98 },
  { y: 78, labelEnd: 62, valueStart: 102 },
  { y: 90, labelEnd: 74, valueStart: 94 },
  { y: 102, labelEnd: 58, valueStart: 104 },
  { y: 114, labelEnd: 66, valueStart: 100 },
] as const;

/**
 * Finanças Empresariais: elevação da coroa da Torre (cota, eixo de simetria, linhas de DRE),
 * emergindo do concreto. O friso de LED sob o colar acende com o hover.
 * Preenche a caixa recebida (preserveAspectRatio xMinYMin meet).
 */
export function RookCrownMotif({ className }: MotifProps) {
  const [body, fade, mask] = useSvgIds("body", "fade", "mask");

  return (
    <svg
      viewBox="16 0 128 120"
      preserveAspectRatio="xMinYMin meet"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E2D6B" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#0F1738" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={fade} gradientUnits="userSpaceOnUse" x1="0" y1="56" x2="0" y2="120">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="160" height="124">
          <rect width="160" height="124" fill={`url(#${fade})`} />
        </mask>
      </defs>
      {/* Cota da largura */}
      <path d="M28 3.5H132M28 1V6M132 1V6" {...HAIRLINE} stroke={LED} strokeOpacity={0.18} strokeWidth={1} />
      <g mask={`url(#${mask})`}>
        <path d={ROOK_PATH} fill={`url(#${body})`} />
        {/* Eixo de simetria (traço-ponto) */}
        <path d="M80 8V120" {...HAIRLINE} stroke={LED} strokeOpacity={0.14} strokeWidth={1} strokeDasharray="12 4 2 4" />
        <path d={ROOK_PATH} {...HAIRLINE} stroke={ROYAL_GLOW} strokeWidth={1.25} />
        {ROOK_STROKES.details.slice(0, 3).map((d) => (
          <path key={d} d={d} {...HAIRLINE} stroke={LED} strokeOpacity={0.12} strokeWidth={1} />
        ))}
        {LEDGER_ROWS.map(({ y, labelEnd, valueStart }) => (
          <g key={y} stroke={LED} strokeWidth={1.5}>
            <path d={`M44 ${y}H${labelEnd}`} {...HAIRLINE} strokeOpacity={0.18} />
            <path d={`M${valueStart} ${y}H116`} {...HAIRLINE} strokeOpacity={0.5} />
          </g>
        ))}
      </g>
      {/* Friso de luz sob o colar: acende com o hover do card. */}
      <g
        stroke={LED}
        className="opacity-40 transition-opacity duration-500 ease-out-expo group-hover/tilt:opacity-100 motion-reduce:transition-none"
      >
        <path d={ROOK_GROOVE_PATH} {...HAIRLINE} strokeWidth={5} strokeOpacity={0.18} />
        <path d={ROOK_GROOVE_PATH} {...HAIRLINE} strokeWidth={1.25} />
      </g>
    </svg>
  );
}

const SHIELD_PATH = "M48 4L86 15V50C86 78 70 98 48 108C26 98 10 78 10 50V15Z";
const BEAM_PATH = "M18 44H78M18 39V49M78 39V49";

/** Finanças Pessoais: escudo com o travessão nivelado (orçamento equilibrado) sobre reservas empilhadas. */
export function BalanceShieldMotif({ className }: MotifProps) {
  const [body] = useSvgIds("body");

  return (
    <svg viewBox="0 0 96 112" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1E2D6B" stopOpacity="0.6" />
          <stop offset="1" stopColor="#0F1738" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <path d={SHIELD_PATH} fill={`url(#${body})`} />
      <path d={SHIELD_PATH} {...HAIRLINE} stroke={ROYAL_GLOW} strokeWidth={1.25} strokeLinejoin="round" />
      {/* Reservas estratégicas */}
      <g stroke={LED} strokeWidth={1.5}>
        <path d="M26 64H70" {...HAIRLINE} strokeOpacity={0.5} />
        <path d="M30 76H66" {...HAIRLINE} strokeOpacity={0.32} />
        <path d="M36 88H60" {...HAIRLINE} strokeOpacity={0.18} />
      </g>
      {/* Equilíbrio: acende com o hover do card. */}
      <g className="opacity-60 transition-opacity duration-500 ease-out-expo group-hover/tilt:opacity-100 motion-reduce:transition-none">
        <path d={BEAM_PATH} {...HAIRLINE} stroke={LED} strokeWidth={5} strokeOpacity={0.16} />
        <path d={BEAM_PATH} {...HAIRLINE} stroke={LED} strokeWidth={1.25} />
        <path d="M48 44L44 51H52Z" fill={LED} />
      </g>
    </svg>
  );
}

/** Mesmo recorte para as duas camadas do motivo do Touro. */
const BULL_VIEWBOX = "22 126 116 80";

/**
 * Investimentos & Bolsa: o Touro do emblema em traço de calor (dourado na cabeça, carmesim na traseira),
 * sobre uma linha de LED dourada. No hover, avança e esquenta.
 */
export function BullMotif({ className }: MotifProps) {
  const [heat, trail] = useSvgIds("heat", "trail");

  return (
    <div aria-hidden="true" className={cn("relative aspect-[116/80]", className)}>
      <svg viewBox={BULL_VIEWBOX} className="absolute inset-0 size-full" focusable="false">
        <defs>
          <linearGradient id={trail} gradientUnits="userSpaceOnUse" x1="22" y1="0" x2="138" y2="0">
            <stop offset="0" stopColor="#F59E0B" stopOpacity="0" />
            <stop offset="0.55" stopColor="#F59E0B" stopOpacity="0.6" />
            <stop offset="1" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <path d="M22 203H138" {...HAIRLINE} stroke={`url(#${trail})`} strokeWidth={5} strokeOpacity={0.22} />
        <path d="M22 203H138" {...HAIRLINE} stroke={`url(#${trail})`} strokeWidth={1} />
      </svg>
      <svg
        viewBox={BULL_VIEWBOX}
        className="absolute inset-0 size-full transition-[translate] duration-700 ease-out-expo motion-safe:group-hover/tilt:translate-x-2"
        focusable="false"
      >
        <defs>
          <linearGradient id={heat} gradientUnits="userSpaceOnUse" x1="132" y1="131" x2="40" y2="202">
            <stop offset="0" stopColor="#F59E0B" />
            <stop offset="0.55" stopColor="#EA580C" />
            <stop offset="1" stopColor="#B91C1C" />
          </linearGradient>
        </defs>
        <path d={BULL_PATH} fill={`url(#${heat})`} fillOpacity={0.16} />
        <path
          d={BULL_PATH}
          fill={`url(#${heat})`}
          fillOpacity={0.3}
          className="opacity-0 transition-opacity duration-500 ease-out-expo group-hover/tilt:opacity-100 motion-reduce:transition-none"
        />
        <path d={BULL_PATH} {...HAIRLINE} stroke={`url(#${heat})`} strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const TICK_PATH = "M0.5 2H9L14.5 5.4";

/** Marcador de lista: um filete de LED que quebra a 32°, como a linha da fachada. */
export function LedTick({ tone = "royal" }: { tone?: "royal" | "bull" }) {
  return (
    <svg
      viewBox="0 0 16 8"
      className={cn("h-2 w-4 overflow-visible", tone === "bull" ? "text-gold" : "text-led")}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d={TICK_PATH} strokeWidth={3} strokeOpacity={0.2} />
        <path d={TICK_PATH} strokeWidth={1.25} />
      </g>
    </svg>
  );
}
