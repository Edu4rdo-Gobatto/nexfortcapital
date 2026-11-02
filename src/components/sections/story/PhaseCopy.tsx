import type { STORY_PHASES } from "@/content/nexfort";
import { cn } from "@/lib/utils";

export type StoryPhase = (typeof STORY_PHASES)[number];

/** Animado pelo GSAP só no palco fixado (opacity + y). */
const ITEM = "group-data-pinned/stage:will-change-[opacity,transform]";

/**
 * Rótulo mínimo de uma fase: espaço reservado para a nova copy.
 * Sempre no DOM; no palco fixado o GSAP troca uma fase pela outra
 * (a timeline anima os [data-story-item] de copy-tower e copy-bull).
 */
export function PhaseCopy({ phase, className }: { phase: StoryPhase; className?: string }) {
  return (
    <div data-story={`copy-${phase.key}`} className={cn("max-w-[34rem]", className)}>
      {/* Sempre um degrau abaixo do h2 da seção, em qualquer largura. */}
      <h3
        data-story-item=""
        className={cn(
          "font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.02] font-semibold tracking-[0.03em] text-led",
          "group-data-pinned/stage:text-[clamp(2.4rem,3.6vw,3.1rem)]",
          ITEM,
        )}
      >
        {phase.symbol}
      </h3>
    </div>
  );
}
