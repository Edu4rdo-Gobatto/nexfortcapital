import { TICKER_ITEMS } from "@/content/nexfort";
import { cn } from "@/lib/utils";

/** Torre em miniatura (azul-real com base dourada): marca o início de cada volta da faixa. */
function RookMark() {
  return (
    <svg
      viewBox="0 0 14 16"
      aria-hidden="true"
      focusable="false"
      className="h-4 w-3.5 shrink-0 overflow-visible motion-reduce:mr-3 motion-reduce:inline-block motion-reduce:align-[-0.2em]"
    >
      <path
        d="M0 0H3.5V1.75H5.25V0H8.75V1.75H10.5V0H14V4L12 5.5 12.5 12H1.5L2 5.5 0 4Z"
        className="fill-royal-glow stroke-led/35"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <path d="M1.5 12H12.5V13.25H14V16H0V13.25H1.5Z" className="fill-gold" />
    </svg>
  );
}

/** Losango vazado em LED: separador entre os demais itens. */
function DiamondMark() {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      className="size-2.5 shrink-0 text-led/50 sm:size-3 motion-reduce:mr-3 motion-reduce:inline-block motion-reduce:align-baseline"
    >
      <path
        d="M6 .75 11.25 6 6 11.25.75 6Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

type TickerListProps = {
  /** Cópia de repetição do loop: oculta para leitores de tela e removida quando não há animação. */
  decorative?: boolean;
};

/**
 * Lista dos pilares de autoridade (Server Component, entra como children do TickerBand).
 * Dois conjuntos de classes que nunca disputam a mesma propriedade:
 * - motion-safe: uma linha contínua; cada cópia mede ao menos a largura da faixa (`--bleed` vem do
 *   TickerBand), então duas cópias sempre cobrem a tela, mesmo em ultrawide (o excedente vira espaço igual).
 * - motion-reduce: uma lista só, quebrando em linhas centralizadas.
 */
export function TickerList({ decorative = false }: TickerListProps) {
  return (
    <ul
      role={decorative ? undefined : "list"}
      aria-hidden={decorative ? true : undefined}
      className={cn(
        "flex items-center",
        "motion-safe:min-w-[calc(100vw+2*var(--bleed))] motion-safe:shrink-0 motion-safe:justify-around",
        "motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-x-7 motion-reduce:gap-y-3",
        decorative && "motion-reduce:hidden",
      )}
    >
      {TICKER_ITEMS.map((item, index) => (
        <li
          key={item}
          className={cn(
            "flex items-center font-display text-sm font-medium tracking-[0.14em] text-led uppercase sm:text-base",
            "motion-safe:shrink-0 motion-safe:gap-x-5 motion-safe:pl-5 motion-safe:whitespace-nowrap",
            "sm:motion-safe:gap-x-8 sm:motion-safe:pl-8 lg:motion-safe:gap-x-10 lg:motion-safe:pl-10",
            // Sem animação: fluxo inline (o glifo vira marcador), linhas equilibradas e centralizadas.
            "motion-reduce:block motion-reduce:text-center motion-reduce:text-balance",
          )}
        >
          {index === 0 ? <RookMark /> : <DiamondMark />}
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
