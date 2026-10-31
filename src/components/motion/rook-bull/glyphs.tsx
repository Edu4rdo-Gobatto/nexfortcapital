import { BULL_BOUNDS, BULL_PATH, EMBLEM_VIEWBOX, ROOK_PATH } from "@/components/brand/geometry";

// Miniaturas da própria geometria do emblema para os gatilhos de modo (decorativas, cor via currentColor).

const BULL_VIEWBOX = `${BULL_BOUNDS.x} ${BULL_BOUNDS.y} ${BULL_BOUNDS.width} ${BULL_BOUNDS.height}`;

export function RookGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox={EMBLEM_VIEWBOX} className={className} aria-hidden="true" focusable="false">
      <path d={ROOK_PATH} fill="currentColor" />
    </svg>
  );
}

export function BullGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox={BULL_VIEWBOX} className={className} aria-hidden="true" focusable="false">
      <path d={BULL_PATH} fill="currentColor" />
    </svg>
  );
}
