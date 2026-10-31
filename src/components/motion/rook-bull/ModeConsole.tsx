"use client";

import { useEffect, useState, type PointerEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CENTERPIECE_MODES, type CenterpieceMode } from "@/content/nexfort";
import { EASE_OUT_EXPO, SPRING_SMOOTH } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { BullGlyph, RookGlyph } from "./glyphs";
import { MODE_FADE } from "./presets";

const MODES = ["tower", "bull"] as const satisfies readonly CenterpieceMode[];
const PANEL_STATES = [null, ...MODES] as const;

const HINT = "Escolha um modo para ver o que acompanhamos em cada frente.";

/** Troca do painel: sai subindo, entra subindo (opacidade + y), sobrepostos na mesma célula da grade. */
const PANEL_ENTER = { ...SPRING_SMOOTH, opacity: { duration: 0.4, ease: EASE_OUT_EXPO } } as const;
const PANEL_EXIT = { duration: 0.2, ease: EASE_OUT_EXPO } as const;

/** Anúncio de uma troca confirmada do modo fixado (clique, toque ou Esc), nunca de prévias. */
function pinnedMessage(mode: CenterpieceMode | null) {
  if (mode === null) return "Modo neutro";
  const copy = CENTERPIECE_MODES[mode];
  return `${copy.trigger} fixado: ${copy.title}`;
}

type ModeConsoleProps = {
  uid: string;
  active: CenterpieceMode | null;
  pinned: CenterpieceMode | null;
  /** Pré-visualização por hover/foco (null encerra). */
  onPreview: (mode: CenterpieceMode | null) => void;
  /** Clique/toque: fixa o modo; clicar no modo fixado volta ao neutro. */
  onToggle: (mode: CenterpieceMode) => void;
  className?: string;
};

/**
 * Gatilhos de modo (botões com aria-pressed), painel de métricas qualitativas (alvo do aria-controls) e um anúncio
 * discreto (aria-live) que narra só as trocas confirmadas do modo fixado: hover e foco não geram ruído.
 */
export function ModeConsole({ uid, active, pinned, onPreview, onToggle, className }: ModeConsoleProps) {
  const panelId = `${uid}-panel`;
  // Gatilho cuja prévia veio do ponteiro (mouse/caneta). WCAG 1.4.13: ela vale em todo o console (gatilhos + painel,
  // onde as métricas aparecem) e só some ao sair dele, com Esc ou quando um clique a consome.
  const [hovered, setHovered] = useState<CenterpieceMode | null>(null);
  // O anúncio só ganha texto depois da primeira escolha: o estado inicial não é lido ao carregar.
  const [announce, setAnnounce] = useState(false);
  const hovering = hovered !== null;

  // Esc dispensa a prévia de hover esteja o foco onde estiver (o onKeyDown do palco só ouve com o foco dentro dele).
  useEffect(() => {
    if (!hovering) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setHovered(null);
      onPreview(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [hovering, onPreview]);

  function handleHover(mode: CenterpieceMode) {
    setHovered(mode);
    onPreview(mode);
  }

  // Foco pré-visualiza; ao perdê-lo, volta à prévia do hover em curso em vez de apagá-la sob o ponteiro.
  function handleFocusChange(mode: CenterpieceMode | null) {
    onPreview(mode ?? hovered);
  }

  function handleToggle(mode: CenterpieceMode) {
    setHovered(null); // o clique consome a prévia: o painel passa a mostrar o modo fixado
    setAnnounce(true);
    onToggle(mode);
  }

  function handlePointerLeave(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || !hovering) return;
    setHovered(null);
    onPreview(null);
  }

  return (
    <div className={cn("relative isolate", className)} onPointerLeave={handlePointerLeave}>
      {/* Laje de concreto com canto chanfrado; o recorte fica só no fundo para não cortar o foco. */}
      <span aria-hidden="true" className="clip-chamfer absolute inset-0 -z-10 bg-white/10 [--cut:16px]" />
      <span aria-hidden="true" className="clip-chamfer concrete-noise absolute inset-px -z-10 bg-concrete [--cut:16px]" />

      <div role="group" aria-label="Modos do emblema" className="grid grid-cols-2">
        {MODES.map((mode) => (
          <ModeTrigger
            key={mode}
            mode={mode}
            active={active === mode}
            pinned={pinned === mode}
            panelId={panelId}
            onHover={handleHover}
            onFocusChange={handleFocusChange}
            onToggle={handleToggle}
          />
        ))}
      </div>

      <div id={panelId} className="border-t border-white/8 px-4 py-4 @min-[26rem]:px-5">
        <div className="grid">
          {/* Reserva a altura do maior estado: nada pula na troca. */}
          {PANEL_STATES.map((state) => (
            <div key={state ?? "neutral"} aria-hidden="true" className="invisible col-start-1 row-start-1">
              <PanelBody mode={state} />
            </div>
          ))}
          <div className="col-start-1 row-start-1 grid">
            <AnimatePresence initial={false}>
              <motion.div
                key={active ?? "neutral"}
                className={cn("col-start-1 row-start-1", active === null && "self-center")}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: PANEL_ENTER }}
                exit={{ opacity: 0, y: -8, transition: PANEL_EXIT }}
              >
                <PanelBody mode={active} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p aria-live="polite" aria-atomic="true" className="sr-only">
        {announce ? pinnedMessage(pinned) : ""}
      </p>
    </div>
  );
}

type ModeTriggerProps = {
  mode: CenterpieceMode;
  active: boolean;
  pinned: boolean;
  panelId: string;
  /** O ponteiro (mouse/caneta) entrou no gatilho. */
  onHover: (mode: CenterpieceMode) => void;
  /** O gatilho ganhou (mode) ou perdeu (null) o foco. */
  onFocusChange: (mode: CenterpieceMode | null) => void;
  onToggle: (mode: CenterpieceMode) => void;
};

function ModeTrigger({ mode, active, pinned, panelId, onHover, onFocusChange, onToggle }: ModeTriggerProps) {
  const copy = CENTERPIECE_MODES[mode];
  const tower = mode === "tower";

  // Só a entrada: a saída do ponteiro é tratada no console inteiro, para a prévia seguir legível no painel.
  function handlePointerEnter(event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType !== "touch") onHover(mode);
  }

  return (
    <button
      type="button"
      aria-pressed={pinned}
      aria-controls={panelId}
      onPointerEnter={handlePointerEnter}
      onFocus={() => onFocusChange(mode)}
      onBlur={() => onFocusChange(null)}
      onClick={() => onToggle(mode)}
      className={cn(
        "group relative isolate flex min-h-18 cursor-pointer flex-col items-start justify-center gap-1.5 px-3.5 py-3 text-left select-none @min-[26rem]:px-5",
        "focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
        !tower && "border-l border-white/8",
      )}
    >
      {/* Estado ativo: lavagem de cor + fita de LED no topo (só opacidade e transform animam). */}
      <motion.span
        aria-hidden="true"
        className={cn("absolute inset-0 -z-10", tower ? "bg-royal/30" : "clip-chamfer bg-gold/6 [--cut:16px]")}
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={MODE_FADE}
      />
      <motion.span
        aria-hidden="true"
        className={cn(
          "absolute top-0 left-0 h-px origin-left forced-colors:bg-[Highlight]",
          tower
            ? "right-0 bg-royal-glow shadow-[0_0_10px_rgb(59_85_196/0.95)]"
            : "right-4 bg-bull-gradient shadow-[0_0_10px_rgb(245_158_11/0.75)]",
        )}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={SPRING_SMOOTH}
      />
      {/* Contraste forçado (Windows) apaga fundos e sombras: uma moldura Highlight marca o botão pressionado.
          Sobreposta (absolute), não muda o layout nem o divisor do Modo Touro. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden border-2 border-[Highlight] forced-colors:group-aria-pressed:block"
      />

      <span className="flex w-full items-center gap-1.5 @min-[26rem]:gap-2">
        {tower ? (
          <RookGlyph className="h-4 w-auto shrink-0 text-royal-glow" />
        ) : (
          <BullGlyph className="h-2.5 w-auto shrink-0 text-gold @min-[26rem]:h-3" />
        )}
        <span className="font-display text-[0.82rem] leading-none tracking-[0.04em] whitespace-nowrap text-led @min-[26rem]:text-[0.95rem]">
          {copy.trigger}
        </span>
        <span className="sr-only">: </span>
        {/* Modo fixado: luz-piloto acesa (aria-pressed já informa o estado a leitores de tela).
            Torre em #8EA2FF (7,7:1 sobre o concreto; o royal-glow ficava abaixo de 3:1). */}
        <motion.span
          aria-hidden="true"
          className={cn("ml-auto size-1.5 shrink-0 forced-colors:bg-[Highlight]", tower ? "bg-[#8EA2FF]" : "bg-gold")}
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: pinned ? 1 : 0, scale: pinned ? 1 : 0.4 }}
          transition={SPRING_SMOOTH}
        />
      </span>
      <span className={cn("text-[0.8rem] leading-snug", active ? "text-led" : "text-muted")}>{copy.title}</span>
    </button>
  );
}

function PanelBody({ mode }: { mode: CenterpieceMode | null }) {
  if (mode === null) {
    return <p className="max-w-[44ch] text-sm leading-relaxed text-pretty text-muted">{HINT}</p>;
  }

  const copy = CENTERPIECE_MODES[mode];

  return (
    <div>
      <p className="flex items-center gap-2.5 font-display text-base tracking-[0.03em] text-led @min-[26rem]:text-lg">
        <span
          aria-hidden="true"
          className={cn("size-2 shrink-0", mode === "tower" ? "bg-royal-glow" : "bg-bull-gradient")}
        />
        {copy.title}
      </p>
      <dl className="mt-2.5 grid gap-x-5 @min-[28rem]:grid-cols-3">
        {copy.metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-baseline justify-between gap-4 border-t border-white/8 py-2 @min-[28rem]:block @min-[28rem]:pb-0"
          >
            <dt className="text-xs text-muted">{metric.label}</dt>
            <dd className="font-mono text-[0.8rem] text-led tabular-nums @min-[28rem]:mt-1">{metric.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
