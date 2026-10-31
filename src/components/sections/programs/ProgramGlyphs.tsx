import { EMBLEM_VIEWBOX, ROOK_PATH } from "@/components/brand/geometry";

type GlyphProps = { className?: string };

/** ITM: a própria torre do emblema ("Torre Mestra"), em contorno. */
export function RookGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox={EMBLEM_VIEWBOX} className={className} aria-hidden="true" focusable="false">
      <path
        d={ROOK_PATH}
        fill="currentColor"
        fillOpacity={0.16}
        stroke="currentColor"
        strokeWidth={10}
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Finance Pro: o mesmo desenho do painel em miniatura (ruído → decisão → degraus). */
export function IndicatorGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true" focusable="false">
      <path
        d="M2 20 4.6 13.5 7.2 23 9.8 16 12 19.5"
        stroke="currentColor"
        strokeOpacity={0.55}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13 5v22" stroke="currentColor" strokeWidth={1.5} />
      <path d="M13 19.5h5v-4.5h5V10.5h7" stroke="currentColor" strokeWidth={1.75} />
    </svg>
  );
}
