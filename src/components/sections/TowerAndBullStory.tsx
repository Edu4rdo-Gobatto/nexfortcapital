"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SECTION_IDS, STORY_PHASES } from "@/content/nexfort";
import { PhaseCopy, type StoryPhase } from "@/components/sections/story/PhaseCopy";
import { StoryBackdrop } from "@/components/sections/story/StoryBackdrop";
import { BullEmblem, TowerEmblem } from "@/components/sections/story/StoryEmblems";
import { StoryRail } from "@/components/sections/story/StoryRail";
import { buildStoryTimeline, clearStoryStyles } from "@/components/sections/story/timeline";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const HEADING_ID = `${SECTION_IDS.story}-titulo`;

/**
 * O palco só é fixado quando há espaço (largura de desktop e altura para o texto caber)
 * e quando o movimento é bem-vindo. Fora disso, as duas fases ficam empilhadas e estáticas.
 */
const PINNED_QUERY = "(min-width: 1024px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)";

const [TOWER, BULL] = STORY_PHASES;

/**
 * Uma fase. Padrão (SSR, mobile, tablet, movimento reduzido): laje de concreto com o canto
 * superior direito cortado a 32° e a fita de LED no corte. Com data-pinned no palco:
 * camada de tela cheia, empilhada sobre a outra fase.
 */
const PHASE = cn(
  "relative isolate grid items-center gap-8 overflow-hidden p-6 [--drop:3rem] [--run:4.8rem]",
  "[clip-path:polygon(0_0,calc(100%_-_var(--run))_0,100%_var(--drop),100%_100%,0_100%)]",
  "sm:gap-10 sm:p-10 sm:[--drop:4rem] sm:[--run:6.4rem] md:grid-cols-[minmax(0,1fr)_auto] md:gap-14 lg:grid-cols-2 lg:p-14",
  "group-data-pinned/stage:absolute group-data-pinned/stage:inset-0 group-data-pinned/stage:grid-cols-2",
  "group-data-pinned/stage:gap-12 group-data-pinned/stage:overflow-visible group-data-pinned/stage:[clip-path:none]",
  "group-data-pinned/stage:p-0 group-data-pinned/stage:pt-20 group-data-pinned/stage:pb-10 group-data-pinned/stage:pl-20",
  "xl:group-data-pinned/stage:pl-24",
);

const EMBLEM_PLACEMENT = "order-first justify-self-center md:order-none";

/** Laje de concreto da fase no fluxo normal; some no palco fixado, onde o StoryBackdrop assume. */
function PhaseSlab({ phase }: { phase: StoryPhase["key"] }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 group-data-pinned/stage:hidden">
      <div className="concrete-noise absolute inset-0 bg-concrete" />
      <div
        className={cn(
          "absolute inset-0",
          phase === "tower"
            ? "bg-radial-[ellipse_at_80%_20%] from-royal/45 via-navy/35 to-transparent to-80%"
            : "bg-radial-[ellipse_at_80%_20%] from-ember/22 via-crimson/12 to-transparent to-80%",
        )}
      />
      <div className="absolute inset-0 border border-white/8" />
      <span className="led-line absolute top-0 left-[calc(100%_-_var(--run))] h-px w-[calc(var(--run)*1.18)] origin-left rotate-[32deg]" />
    </div>
  );
}

/**
 * "O Método Torre & Touro": a narrativa dos dois símbolos da marca.
 * Desktop: palco fixado (ScrollTrigger pin + scrub) em que um corte de LED a 32° divide a tela,
 * a Torre azul se constrói e o Touro âmbar acende dentro dela. Demais casos: fases empilhadas.
 */
export function TowerAndBullStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia(); // registrado no contexto do useGSAP: revertido automaticamente
      mm.add(PINNED_QUERY, () => {
        const stage = stageRef.current;
        if (!stage) return;

        // O layout fixado (camadas empilhadas, h-svh) só existe enquanto esta condição vale.
        stage.setAttribute("data-pinned", "");
        buildStoryTimeline(stage, {
          trigger: stage,
          pin: true,
          scrub: 1,
          start: "top top",
          end: "+=220%",
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // Qualquer refreshPriority liga a ordenação por posição no refresh global, para que os gatilhos
          // das seções abaixo considerem o espaço do pin mesmo quando ele é recriado (resize, preferência de movimento).
          refreshPriority: 0,
        });

        // Roda depois que o GSAP desfaz o pin: limpa o que sobrou da timeline e volta ao layout empilhado.
        return () => {
          clearStoryStyles(stage);
          stage.removeAttribute("data-pinned");
        };
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id={SECTION_IDS.story}
      aria-labelledby={HEADING_ID}
      className="relative overflow-x-clip"
    >
      <div className="mx-auto w-full max-w-7xl px-5 pt-24 pb-12 sm:px-8 sm:pt-32 sm:pb-16">
        <h2
          id={HEADING_ID}
          className="font-display text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.06] font-semibold tracking-[0.015em] text-led"
        >
          O Método Torre &amp; Touro
        </h2>
      </div>

      <div ref={stageRef} className="group/stage relative data-pinned:h-svh data-pinned:overflow-hidden">
        <StoryBackdrop />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8 sm:pb-32 group-data-pinned/stage:h-full group-data-pinned/stage:pb-0">
          <div className="relative grid gap-6 sm:gap-8 group-data-pinned/stage:block group-data-pinned/stage:h-full">
            <StoryRail />

            <div className={PHASE}>
              <PhaseSlab phase={TOWER.key} />
              <PhaseCopy phase={TOWER} />
              <TowerEmblem className={EMBLEM_PLACEMENT} />
            </div>

            <div className={PHASE}>
              <PhaseSlab phase={BULL.key} />
              <PhaseCopy phase={BULL} />
              <BullEmblem className={EMBLEM_PLACEMENT} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
