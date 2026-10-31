import { useId } from "react";
import { EMBLEM_VIEWBOX, ROOK_GROOVE_PATH, ROOK_PATH, ROOK_STROKES } from "@/components/brand/geometry";

type RookMonogramProps = {
  initials: string;
  className?: string;
};

/**
 * Monograma do sócio esculpido na torre do emblema: as iniciais ocupam o lugar do touro,
 * com o mesmo gradiente de calor (gold → ember → crimson). Decorativo: o nome fica no texto ao lado.
 */
export function RookMonogram({ initials, className }: RookMonogramProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const stone = `${uid}-stone`;
  const heat = `${uid}-heat`;

  return (
    <svg viewBox={EMBLEM_VIEWBOX} className={className} aria-hidden="true" focusable="false">
      <defs>
        {/* Luz de cima: azul-real nas ameias, marinho profundo na base. */}
        <linearGradient id={stone} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#22337A" />
          <stop offset="0.55" stopColor="#111A44" />
          <stop offset="1" stopColor="#0A0F29" />
        </linearGradient>
        <linearGradient id={heat} gradientUnits="userSpaceOnUse" x1="80" y1="112" x2="80" y2="152">
          <stop offset="0" stopColor="#F59E0B" />
          <stop offset="0.55" stopColor="#EA580C" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
      </defs>

      <path d={ROOK_PATH} fill={`url(#${stone})`} />
      {/* Arestas talhadas: colar, gargalo e molduras da base. */}
      <g stroke="#F8FAFC" strokeOpacity={0.1} strokeWidth={1}>
        {ROOK_STROKES.details.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path d={ROOK_GROOVE_PATH} stroke="#F8FAFC" strokeOpacity={0.55} strokeWidth={1} />
      <path d={ROOK_PATH} fill="none" stroke="#F8FAFC" strokeOpacity={0.3} strokeWidth={1.2} />

      <text
        x="80"
        y="150"
        textAnchor="middle"
        className="font-display"
        fontSize="48"
        fontWeight={600}
        letterSpacing="1"
        fill={`url(#${heat})`}
      >
        {initials}
      </text>
    </svg>
  );
}
