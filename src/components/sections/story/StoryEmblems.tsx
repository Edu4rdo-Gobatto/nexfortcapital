import { useId } from "react";
import {
  BULL_PATH,
  EMBLEM_VIEWBOX,
  ROOK_GROOVE_PATH,
  ROOK_PATH,
  ROOK_STROKES,
} from "@/components/brand/geometry";
import { cn } from "@/lib/utils";

/**
 * Mesma caixa para os dois emblemas: no modo fixado (pin) eles ocupam a mesma célula
 * e se sobrepõem pixel a pixel, então o touro acende exatamente dentro da torre.
 */
const EMBLEM_BOX =
  "relative aspect-[2/3] h-60 shrink-0 sm:h-72 lg:h-96 group-data-pinned/stage:h-[min(64svh,38rem)]";

/** Camadas animadas pelo GSAP só ganham will-change enquanto o palco está fixado. */
const ANIMATED = "group-data-pinned/stage:will-change-[opacity,transform]";

const SVG_LAYER = "absolute inset-0 size-full overflow-visible";

/** Fiadas da torre de baixo para cima (fundação primeiro): base, colar, friso e ameias. */
const COURSES = [
  ROOK_STROKES.details[4],
  ROOK_STROKES.details[3],
  ROOK_STROKES.details[2],
  ROOK_GROOVE_PATH,
  ROOK_STROKES.details[1],
  ROOK_STROKES.details[0],
];

/** Contorno em ordem de construção: base → colunas → ameias. */
const OUTLINE_PARTS = [
  [ROOK_STROKES.base],
  [ROOK_STROKES.columnLeft, ROOK_STROKES.columnRight],
  [ROOK_STROKES.battlement],
];

/** Gradiente de pedra da torre (os mesmos tons do NexfortEmblem). */
function RookFill({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2B3E94" />
      <stop offset="1" stopColor="#121A45" />
    </linearGradient>
  );
}

/** Onda de calor do touro: ouro → âmbar → carmim, no espaço do emblema. */
function HeatFill({ id }: { id: string }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="80" y1="131" x2="80" y2="203">
      <stop offset="0" stopColor="#F59E0B" />
      <stop offset="0.55" stopColor="#EA580C" />
      <stop offset="1" stopColor="#B91C1C" />
    </linearGradient>
  );
}

function useSvgIds<const T extends readonly string[]>(names: T) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return Object.fromEntries(names.map((name) => [name, `${uid}-${name}`])) as Record<T[number], string>;
}

/**
 * A Torre: planta tracejada, massa de pedra, fiadas de LED e contorno com brilho real.
 * Fora do modo fixado tudo aparece pronto; no palco fixado o GSAP constrói camada por camada.
 */
export function TowerEmblem({ className }: { className?: string }) {
  const ids = useSvgIds(["fill"] as const);

  return (
    <div aria-hidden="true" className={cn(EMBLEM_BOX, className)}>
      <div
        data-story="halo-tower"
        className={cn(
          "absolute inset-[-32%] bg-radial from-royal-glow/45 via-royal/20 to-transparent to-70%",
          ANIMATED,
        )}
      />
      {/* Brilho âmbar do Touro: existe só no palco fixado (no fluxo normal ele vive no BullEmblem). */}
      <div
        data-story="halo-bull"
        className="absolute inset-[-42%] hidden bg-radial from-gold/40 via-ember/16 to-transparent to-70% will-change-[opacity,transform] group-data-pinned/stage:block"
      />

      {/* Planta: o contorno tracejado aparece antes da construção. */}
      <svg viewBox={EMBLEM_VIEWBOX} className={cn(SVG_LAYER, "text-royal-glow")} focusable="false">
        <path
          d={ROOK_PATH}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.6}
          strokeWidth={1}
          strokeDasharray="3 5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <svg data-story="rook-mass" viewBox={EMBLEM_VIEWBOX} className={cn(SVG_LAYER, ANIMATED)} focusable="false">
        <defs>
          <RookFill id={ids.fill} />
        </defs>
        <path d={ROOK_PATH} fill={`url(#${ids.fill})`} />
      </svg>

      <svg viewBox={EMBLEM_VIEWBOX} className={cn(SVG_LAYER, "text-royal-glow")} focusable="false">
        {COURSES.map((d) => (
          <g key={d} data-story="course">
            <path d={d} stroke="currentColor" strokeOpacity={0.45} strokeWidth={3} strokeLinecap="round" />
            <path d={d} stroke="#F8FAFC" strokeOpacity={0.8} strokeWidth={0.7} strokeLinecap="round" />
          </g>
        ))}
      </svg>

      <svg
        data-story="rook-outline"
        viewBox={EMBLEM_VIEWBOX}
        className={cn(SVG_LAYER, "text-royal-glow", ANIMATED)}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        focusable="false"
      >
        {OUTLINE_PARTS.map((paths) => (
          <g key={paths[0]} data-story="outline-part">
            {paths.map((d) => (
              <g key={d}>
                <path d={d} strokeOpacity={0.4} strokeWidth={3.2} />
                <path d={d} strokeWidth={1.3} />
              </g>
            ))}
          </g>
        ))}
      </svg>

      {/* Contorno de LED branco, o mesmo da logo: assume no lugar do azul quando o Touro acende. */}
      <svg
        data-story="rook-outline-warm"
        viewBox={EMBLEM_VIEWBOX}
        className={cn(SVG_LAYER, "hidden will-change-[opacity] group-data-pinned/stage:block")}
        focusable="false"
      >
        <path d={ROOK_PATH} fill="none" stroke="#F8FAFC" strokeOpacity={0.36} strokeWidth={1.2} />
        <path d={ROOK_GROOVE_PATH} stroke="#F8FAFC" strokeOpacity={0.26} strokeWidth={0.8} />
      </svg>
    </div>
  );
}

/**
 * O Touro: recortado pela silhueta da torre, com o gradiente de calor e um halo difuso.
 * No fluxo normal traz a própria torre e o próprio brilho; no palco fixado só o touro aparece,
 * sobreposto à TowerEmblem.
 */
export function BullEmblem({ className }: { className?: string }) {
  const ids = useSvgIds(["fill", "rookA", "rookB", "bullClip", "heatA", "heatB", "wave", "blur"] as const);

  return (
    <div aria-hidden="true" className={cn(EMBLEM_BOX, className)}>
      <div className="absolute inset-[-42%] bg-radial from-gold/35 via-ember/14 to-transparent to-70% group-data-pinned/stage:hidden" />
      <svg viewBox={EMBLEM_VIEWBOX} className={cn(SVG_LAYER, "group-data-pinned/stage:hidden")} focusable="false">
        <defs>
          <RookFill id={ids.fill} />
        </defs>
        <path d={ROOK_PATH} fill={`url(#${ids.fill})`} />
        <path d={ROOK_PATH} fill="none" stroke="#F8FAFC" strokeOpacity={0.32} strokeWidth={1.2} />
        <path d={ROOK_GROOVE_PATH} stroke="#F8FAFC" strokeOpacity={0.22} strokeWidth={0.8} />
      </svg>

      {/* Calor que vaza da pedra: touro desfocado (o filtro é estático; só a opacidade da camada muda). */}
      <svg
        data-story="bull-bloom"
        viewBox={EMBLEM_VIEWBOX}
        className={cn(SVG_LAYER, "opacity-60", ANIMATED)}
        focusable="false"
      >
        <defs>
          <clipPath id={ids.rookB}>
            <path d={ROOK_PATH} />
          </clipPath>
          <HeatFill id={ids.heatB} />
          <filter id={ids.blur} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <g filter={`url(#${ids.blur})`}>
          <path d={BULL_PATH} fill={`url(#${ids.heatB})`} clipPath={`url(#${ids.rookB})`} />
        </g>
      </svg>

      <svg data-story="bull" viewBox={EMBLEM_VIEWBOX} className={cn(SVG_LAYER, ANIMATED)} focusable="false">
        <defs>
          <clipPath id={ids.rookA}>
            <path d={ROOK_PATH} />
          </clipPath>
          <clipPath id={ids.bullClip}>
            <path d={BULL_PATH} />
          </clipPath>
          <HeatFill id={ids.heatA} />
          <linearGradient id={ids.wave} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F8FAFC" stopOpacity={0} />
            <stop offset="0.5" stopColor="#F8FAFC" stopOpacity={0.6} />
            <stop offset="1" stopColor="#F8FAFC" stopOpacity={0} />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${ids.rookA})`}>
          <g data-story="bull-body">
            <path d={BULL_PATH} fill={`url(#${ids.heatA})`} />
            {/* Faixa incandescente que sobe pelo touro na ignição; em repouso fica acima dele, fora do recorte. */}
            <g clipPath={`url(#${ids.bullClip})`}>
              <rect data-story="bull-heat" x="16" y="96" width="128" height="30" fill={`url(#${ids.wave})`} />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
