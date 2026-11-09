import { cn } from "@/lib/cn";
import { EMBLEM, WORDMARK } from "./marks";

const WORDMARK_ID = "nexfort-wordmark";
const EMBLEM_ID = "nexfort-emblem";
const SILHOUETTE_ID = "nexfort-emblem-silhouette";
const MIOLO_GRADIENT_ID = "nexfort-emblem-miolo";
const MIOLO_CLIP_ID = "nexfort-emblem-clip";

/** "NEXFORT CAPITAL" traçado do logo original. Herda a cor do texto. O desenho é definido uma vez, em BrandSymbols. */
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
      <use href={`#${WORDMARK_ID}`} />
    </svg>
  );
}

/**
 * Define o nome e o emblema 2D uma vez por página. Todo uso é um <use>, então os caminhos (o do nome tem 18 KB, o
 * da silhueta 5 KB) não se repetem no HTML. O emblema é a reserva sem WebGL ou sem JavaScript.
 * O miolo (urso e touro) é o mesmo caminho do 3D, que passa um pouco da borda: aqui ele é recortado pela silhueta.
 */
export function BrandSymbols() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <path id={SILHOUETTE_ID} d={EMBLEM.silhouette} fillRule="evenodd" />
        <linearGradient id={MIOLO_GRADIENT_ID} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1={EMBLEM.gradient.y1} y2={EMBLEM.gradient.y2}>
          {EMBLEM.gradient.stops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
        <clipPath id={MIOLO_CLIP_ID}>
          <use href={`#${SILHOUETTE_ID}`} clipRule="evenodd" />
        </clipPath>
        <symbol id={WORDMARK_ID} viewBox={WORDMARK.viewBox}>
          <path d={WORDMARK.d} fillRule="evenodd" />
        </symbol>
        <symbol id={EMBLEM_ID} viewBox={EMBLEM.viewBox}>
          <use href={`#${SILHOUETTE_ID}`} fill={EMBLEM.navy} />
          <path d={EMBLEM.miolo} fill={`url(#${MIOLO_GRADIENT_ID})`} fillRule="evenodd" clipPath={`url(#${MIOLO_CLIP_ID})`} />
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
