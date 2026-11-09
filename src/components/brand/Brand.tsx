import { cn } from "@/lib/cn";
import { EMBLEM, WORDMARK } from "./marks";

/** "NEXFORT CAPITAL" traçado do logo original. Herda a cor do texto. */
export function Wordmark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={WORDMARK.viewBox}
      className={cn("block h-auto", className)}
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path d={WORDMARK.d} fillRule="evenodd" />
    </svg>
  );
}

const EMBLEM_ID = "nexfort-emblem";
const MIOLO_GRADIENT_ID = "nexfort-emblem-miolo";

/** Define o emblema 2D uma vez por página (usado como reserva sem WebGL ou sem JavaScript). */
export function EmblemSymbol() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={MIOLO_GRADIENT_ID} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={EMBLEM.gradient.y1} y2={EMBLEM.gradient.y2}>
          {EMBLEM.gradient.stops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <symbol id={EMBLEM_ID} viewBox={EMBLEM.viewBox}>
          <path d={EMBLEM.silhouette} fill={EMBLEM.navy} fillRule="evenodd" />
          <path d={EMBLEM.miolo} fill={`url(#${MIOLO_GRADIENT_ID})`} fillRule="evenodd" />
          <path d={EMBLEM.lines} fill="#dcdcf0" fillRule="evenodd" />
        </symbol>
      </defs>
    </svg>
  );
}

/** A Torre do logo em 2D, idêntica ao original. */
export function Emblem({ className }: { className?: string }) {
  return (
    <svg viewBox={EMBLEM.viewBox} className={className} aria-hidden="true" focusable="false">
      <use href={`#${EMBLEM_ID}`} />
    </svg>
  );
}
