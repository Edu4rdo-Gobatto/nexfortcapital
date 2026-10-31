"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CtaLink } from "@/components/ui/CtaLink";
import { PROGRAMS, whatsappLink } from "@/content/nexfort";
import { EASE_OUT_EXPO, SPRING_SMOOTH } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { BAND_VIEW, NEXT_EDITION } from "./band";
import { BandCaption } from "./BandCaption";
import { EditionsBand } from "./EditionsBand";
import { IndicatorBand } from "./IndicatorBand";
import { LED_GLOW } from "./led";
import { IndicatorGlyph, RookGlyph } from "./ProgramGlyphs";
import { WithNumerals } from "./numerals";

type Program = (typeof PROGRAMS)[number];

/** Cor de cada programa: azul-real = estrutura (a Torre); ouro = energia e indicadores. */
const ACCENTS = {
  itm: { Glyph: RookGlyph, glyph: "text-royal-glow", marker: "bg-royal-glow" },
  "finance-pro": { Glyph: IndicatorGlyph, glyph: "text-gold", marker: "bg-gold" },
} satisfies Record<Program["id"], { Glyph: typeof RookGlyph; glyph: string; marker: string }>;

/** Corte da aba ativa a 32° (24 × 15 px): o mesmo ângulo da fita de LED da fachada. */
const TAB_CUT = "[clip-path:polygon(0_0,calc(100%_-_24px)_0,100%_15px,100%_100%,0_100%)]";

const PANEL_ENTER = { ...SPRING_SMOOTH, opacity: { duration: 0.45, ease: EASE_OUT_EXPO } };
const PANEL_EXIT = { duration: 0.18, ease: EASE_OUT_EXPO };

/**
 * Todas as camadas do painel ocupam a mesma célula da grade (empilhadas). content-start: a sobra
 * de altura do programa mais curto vai para o fim do painel, nunca para o meio do conteúdo.
 */
const PANEL_LAYER =
  "col-start-1 row-start-1 grid content-start gap-x-12 gap-y-10 px-5 py-8 sm:p-10 lg:grid-cols-12 lg:p-12";

/** Legenda da aba: expande a sigla (ITM); quando não há sigla, mostra o tipo de programa. */
function tabCaption(program: Program) {
  return program.shortName === program.name ? program.editionsLabel : program.name;
}

/**
 * Placa de concreto da aba ativa. Desliza entre as abas via layoutId e se funde ao painel
 * (cobre a linha inferior da lista de abas). O LED corre no topo e desce a 32° no corte.
 */
function TabPlate({ layoutId }: { layoutId: string }) {
  return (
    <motion.span
      layoutId={layoutId}
      transition={SPRING_SMOOTH}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -bottom-px -z-10"
    >
      <span className={cn("absolute inset-0 bg-white/8", TAB_CUT)} />
      <span className={cn("concrete-noise absolute inset-x-px top-px bottom-0 bg-concrete", TAB_CUT)} />
      <span
        className={cn(
          "absolute top-0 left-0 h-px w-[calc(100%-24px)] bg-linear-to-r from-transparent via-led/60 to-led",
          LED_GLOW,
        )}
      />
      <span
        className={cn(
          "absolute top-0 left-[calc(100%-24px)] h-px w-[28.3px] origin-left rotate-32 bg-linear-to-r from-led to-led/30",
          LED_GLOW,
        )}
      />
    </motion.span>
  );
}

/** Reserva exatamente a caixa da faixa do programa (mesma proporção + mesma legenda), sem desenhar nada. */
function BandSpace({ program, className }: { program: Program; className?: string }) {
  return (
    <div className={className}>
      <div style={{ aspectRatio: `${BAND_VIEW.w} / ${BAND_VIEW.h}` }} />
      {program.editions ? <BandCaption caption={program.editionsLabel} aside={NEXT_EDITION} /> : <BandCaption />}
    </div>
  );
}

type ProgramDetailsProps = {
  program: Program;
  /** Id da nota do CTA (aria-describedby). Ausente na cópia de medida. */
  noteId?: string;
  /** Cópia invisível que só reserva altura: sem animações, sem link e sem ids. */
  sizer?: boolean;
};

function ProgramDetails({ program, noteId, sizer = false }: ProgramDetailsProps) {
  const accent = ACCENTS[program.id];
  const highlights: readonly string[] = program.highlights;

  return (
    <>
      <div className="lg:col-span-7">
        <h3 className="font-display text-xl tracking-[0.03em] text-led sm:text-2xl">{program.name}</h3>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-muted sm:text-lg">{program.description}</p>
        {/* A ITM mostra as edições (o editionsLabel vira a legenda da coroa); o Finance Pro, o painel de indicadores. */}
        {sizer ? (
          <BandSpace program={program} className="mt-10" />
        ) : program.editions ? (
          <EditionsBand
            editions={program.editions}
            label={`Edições da ${program.name}`}
            caption={program.editionsLabel}
            className="mt-10"
          />
        ) : (
          <IndicatorBand className="mt-10" />
        )}
      </div>

      <div className="flex flex-col lg:col-span-5 lg:border-l lg:border-white/8 lg:pl-12">
        <ul className="border-t border-white/8">
          {highlights.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3.5 border-b border-white/8 py-4 text-[0.95rem] leading-snug text-led/90 sm:text-base"
            >
              <span aria-hidden="true" className={cn("mt-[0.45em] size-1.5 shrink-0", accent.marker)} />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-8 lg:mt-auto lg:pt-10">
          <CtaLink
            href={sizer ? undefined : whatsappLink(program.whatsappMessage)}
            external={!sizer}
            size="lg"
            aria-describedby={noteId}
            className="w-full sm:w-auto"
          >
            <WhatsAppIcon className="size-5 shrink-0" />
            {program.cta}
          </CtaLink>
          <p id={noteId} className="mt-3 text-xs text-muted sm:text-sm">
            Abre o WhatsApp com a mensagem pronta para enviar.
          </p>
        </div>
      </div>
    </>
  );
}

/**
 * Vitrine dos programas: abas WAI-ARIA (setas, Home/End, tabindex itinerante) e um único
 * painel persistente cujo conteúdo troca com AnimatePresence (mode "wait").
 */
export function ProgramShowcase({ className }: { className?: string }) {
  const uid = useId();
  const tablistRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const program = PROGRAMS[active];
  const panelId = `${uid}-panel`;
  const noteId = `${uid}-cta-note`;
  const tabId = (id: Program["id"]) => `${uid}-tab-${id}`;

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = PROGRAMS.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = index === last ? 0 : index + 1;
        break;
      case "ArrowLeft":
        next = index === 0 ? last : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActive(next);
    tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  }

  return (
    <div className={className}>
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Programas da Nexfort Capital"
        className="grid grid-cols-2 border-b border-white/8"
      >
        {PROGRAMS.map((item, index) => {
          const selected = index === active;
          const { Glyph, glyph } = ACCENTS[item.id];
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={tabId(item.id)}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "relative isolate flex min-w-0 items-start gap-3 px-3.5 pt-5 pb-4 text-left sm:gap-4 sm:px-7 sm:pt-7 sm:pb-6",
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
                selected ? "text-led" : "cursor-pointer text-muted hover:text-led",
              )}
            >
              {selected ? <TabPlate layoutId={`${uid}-plate`} /> : null}
              <span className="flex size-8 shrink-0 items-center justify-center sm:size-10">
                <Glyph className={cn("h-full w-auto", selected ? glyph : "opacity-60")} />
              </span>
              <span className="flex min-w-0 flex-col gap-1.5 pt-0.5">
                <span className="font-display text-lg leading-none font-semibold tracking-[0.04em] sm:text-2xl">
                  {item.shortName}
                </span>
                <span className="text-xs leading-snug text-muted sm:text-sm">
                  <WithNumerals text={tabCaption(item)} />
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(program.id)}
        tabIndex={0}
        className="concrete-noise relative grid border-x border-b border-white/8 bg-concrete focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        {/* Cópias invisíveis de todos os programas na mesma célula: o painel assume a altura do
            maior, então trocar de aba nunca empurra o resto da página (em nenhuma largura). */}
        {PROGRAMS.map((item) => (
          <div key={item.id} aria-hidden="true" inert className={cn(PANEL_LAYER, "invisible")}>
            <ProgramDetails program={item} sizer />
          </div>
        ))}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: PANEL_ENTER }}
            exit={{ opacity: 0, y: -10, transition: PANEL_EXIT }}
            className={PANEL_LAYER}
          >
            <ProgramDetails program={program} noteId={noteId} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
