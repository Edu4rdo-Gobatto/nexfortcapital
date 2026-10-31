import type { STORY_PHASES } from "@/content/nexfort";
import { cn } from "@/lib/utils";

export type StoryPhase = (typeof STORY_PHASES)[number];

/** Cor de cada símbolo nos marcadores da lista: azul real (estrutura) e ouro (multiplicação). */
const MARKER: Record<StoryPhase["key"], string> = {
  tower: "bg-royal-glow shadow-[0_0_10px_rgb(59_85_196/0.9)]",
  bull: "bg-gold shadow-[0_0_10px_rgb(245_158_11/0.85)]",
};

/** Animado pelo GSAP só no palco fixado (opacity + y). */
const ITEM = "group-data-pinned/stage:will-change-[opacity,transform]";

/**
 * Texto de uma fase: o símbolo e o título formam o h3 ("A Torre: A Base Inabalável").
 * Sempre no DOM e legível; no palco fixado o GSAP troca uma fase pela outra.
 */
export function PhaseCopy({ phase, className }: { phase: StoryPhase; className?: string }) {
  return (
    <div data-story={`copy-${phase.key}`} className={cn("max-w-[34rem]", className)}>
      <h3 data-story-item="" className={cn("font-display tracking-[0.03em] text-led", ITEM)}>
        {/* Sempre um degrau abaixo do h2 da seção, em qualquer largura. */}
        <span className="block text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.02] font-semibold group-data-pinned/stage:text-[clamp(2.4rem,3.6vw,3.1rem)]">
          {phase.symbol}
          <span className="sr-only">:</span>
        </span>{" "}
        <span className="mt-3 block text-xl leading-snug sm:text-2xl">{phase.title}</span>
      </h3>
      <p data-story-item="" className={cn("mt-6 max-w-[46ch] text-base leading-relaxed text-muted sm:text-lg", ITEM)}>
        {phase.body}
      </p>
      {/* As linhas ficam nos itens (e não na lista) para sumirem junto com eles na troca de fase. */}
      <ul role="list" className="mt-8">
        {phase.points.map((point) => (
          <li
            key={point}
            data-story-item=""
            className={cn(
              "flex items-start gap-4 border-b border-white/8 py-3 text-[0.95rem] leading-snug text-led/90 first:border-t sm:text-base",
              ITEM,
            )}
          >
            {/* Alinhado ao meio da primeira linha, mesmo quando o item quebra em duas. */}
            <span aria-hidden="true" className={cn("mt-[0.66em] h-px w-6 shrink-0", MARKER[phase.key])} />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}
