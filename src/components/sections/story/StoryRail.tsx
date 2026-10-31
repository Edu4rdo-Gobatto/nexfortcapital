/**
 * Indicador de progresso do palco fixado: fita de LED vertical (scaleY = progresso)
 * entre as duas paradas, Torre e Touro. Decorativo: o texto das fases já está no DOM.
 */
export function StoryRail() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 hidden w-14 items-center justify-center pt-20 pb-10 group-data-pinned/stage:flex"
    >
      <div className="flex h-[min(50svh,24rem)] flex-col items-center gap-3">
        <span data-story="rail-tower" className="font-display text-[0.8rem] tracking-[0.14em] text-led">
          Torre
        </span>
        <span className="size-2 bg-royal-glow shadow-[0_0_10px_rgb(59_85_196/0.9)]" />
        <span className="relative w-px flex-1 bg-white/12">
          <span
            data-story="rail-fill"
            className="absolute inset-0 origin-top bg-led shadow-[0_0_8px_rgb(248_250_252/0.6)] will-change-transform"
          />
        </span>
        <span className="relative size-2 border border-gold/50">
          <span
            data-story="rail-bull-dot"
            className="absolute -inset-px bg-gold shadow-[0_0_10px_rgb(245_158_11/0.85)]"
          />
        </span>
        <span data-story="rail-bull" className="font-display text-[0.8rem] tracking-[0.14em] text-led">
          Touro
        </span>
      </div>
    </div>
  );
}
