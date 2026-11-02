"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CtaLink } from "@/components/ui/CtaLink";
import { SIMULATOR, WHATSAPP_MESSAGES, whatsappLink } from "@/content/nexfort";
import { EASE_OUT_EXPO } from "@/lib/animations";
import { formatBRL, formatBRLCompact } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { AnimatedCurrency } from "./AnimatedCurrency";
import { BandKey, SavingsKey, StrategyKey } from "./keys";
import { RangeField } from "./RangeField";
import { DEFAULT_INPUT, formatAnnualRate, formatYears, simulate, type Simulation } from "./simulation";
import { WealthChart } from "./WealthChart";
import { YearTable } from "./YearTable";

/** Leitores de tela ouvem o resultado depois que o controle para de mexer, não a cada passo. */
const ANNOUNCE_DELAY_MS = 700;

/** Canto chanfrado no ângulo da fachada (32°): 56px na horizontal, 35px na vertical. */
const CHAMFER_RUN = 56;
const CHAMFER_DROP = 35;
const CHAMFER_DIAGONAL = Math.hypot(CHAMFER_RUN, CHAMFER_DROP);
const CHAMFER_CLIP = `polygon(0 0, calc(100% - ${CHAMFER_RUN}px) 0, 100% ${CHAMFER_DROP}px, 100% 100%, 0 100%)`;

/** Fita de LED do chanfro: risca uma vez ao entrar na tela (mesma curva do LedDivider). */
const LED_HIDDEN = { scaleX: 0, opacity: 0 };
const LED_SHOWN = { scaleX: 1, opacity: 1 };
const LED_VIEWPORT = { once: true };
const LED_TRANSITION = { duration: 0.9, ease: EASE_OUT_EXPO, delay: 0.3 };

const CTA_HREF = whatsappLink(WHATSAPP_MESSAGES.simulacao);

const H3 = "font-display text-xl tracking-[0.03em] text-led sm:text-2xl";
const CELL = "p-5 sm:p-8 xl:p-10";
/** Rótulo de resultado: a chave visual acompanha a primeira linha do texto. */
const RESULT_LABEL = "flex items-baseline gap-2.5 text-sm text-muted";
/**
 * Números grandes medidos pela célula (container query): o maior valor possível sempre cabe.
 * Concatenado sem cn(): o tailwind-merge descartaria `leading-none` diante de um tamanho de fonte.
 */
const FIGURE = "block font-mono leading-none whitespace-nowrap text-led tabular-nums";

type SimulatorConsoleProps = {
  className?: string;
};

/**
 * Console do simulador: controles, resultados com contagem por mola, gráfico e CTA.
 * Mobile: controles → resultados → gráfico → aviso → CTA.
 * lg: controles e resultados à esquerda; gráfico, aviso e CTA à direita.
 */
export function SimulatorConsole({ className }: SimulatorConsoleProps) {
  const uid = useId();
  const ids = {
    initial: `${uid}-initial`,
    monthly: `${uid}-monthly`,
    years: `${uid}-years`,
    ctaHint: `${uid}-cta-hint`,
  };

  const [initial, setInitial] = useState(DEFAULT_INPUT.initial);
  const [monthly, setMonthly] = useState(DEFAULT_INPUT.monthly);
  const [years, setYears] = useState(DEFAULT_INPUT.years);
  const simulation = useMemo(() => simulate({ initial, monthly, years }), [initial, monthly, years]);

  // Cópia "assentada" para o aria-live: atualiza só depois de uma pausa nos controles.
  const [announced, setAnnounced] = useState<Simulation>(simulation);
  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounced(simulation), ANNOUNCE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [simulation]);

  return (
    <div className={cn("relative", className)}>
      {/* Fita de LED no chanfro, fora do recorte para o brilho vazar. Desenha uma vez ao entrar na tela. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-0 z-10 h-px origin-left rotate-32"
        style={{ left: `calc(100% - ${CHAMFER_RUN}px)`, width: CHAMFER_DIAGONAL }}
      >
        <motion.span
          className="led-line absolute inset-0 origin-left"
          initial={LED_HIDDEN}
          whileInView={LED_SHOWN}
          viewport={LED_VIEWPORT}
          transition={LED_TRANSITION}
        />
      </span>

      <div
        className="concrete-noise grid border border-white/8 bg-concrete lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr]"
        style={{ clipPath: CHAMFER_CLIP }}
      >
        {/* Controles */}
        <div className={cn(CELL, "lg:col-start-1 lg:row-start-1")}>
          <fieldset className="min-w-0">
            <legend className={H3}>Seus números</legend>
            <div className="mt-6 grid gap-6 sm:mt-8">
              <RangeField
                id={ids.initial}
                label="Patrimônio inicial"
                value={initial}
                min={SIMULATOR.initial.min}
                max={SIMULATOR.initial.max}
                step={SIMULATOR.initial.step}
                display={formatBRL(initial)}
                valueText={formatBRL(initial)}
                minLabel={formatBRLCompact(SIMULATOR.initial.min)}
                maxLabel={formatBRLCompact(SIMULATOR.initial.max)}
                onValueChange={setInitial}
              />
              <RangeField
                id={ids.monthly}
                label="Aporte mensal"
                value={monthly}
                min={SIMULATOR.monthly.min}
                max={SIMULATOR.monthly.max}
                step={SIMULATOR.monthly.step}
                display={formatBRL(monthly)}
                valueText={`${formatBRL(monthly)} por mês`}
                minLabel={formatBRLCompact(SIMULATOR.monthly.min)}
                maxLabel={formatBRLCompact(SIMULATOR.monthly.max)}
                onValueChange={setMonthly}
              />
              <RangeField
                id={ids.years}
                label="Horizonte de tempo"
                value={years}
                min={SIMULATOR.years.min}
                max={SIMULATOR.years.max}
                step={SIMULATOR.years.step}
                display={formatYears(years)}
                valueText={formatYears(years)}
                minLabel={formatYears(SIMULATOR.years.min)}
                maxLabel={formatYears(SIMULATOR.years.max)}
                onValueChange={setYears}
              />
            </div>
          </fieldset>
        </div>

        {/* Resultados */}
        <div className={cn(CELL, "border-t border-white/8 lg:col-start-1 lg:row-start-2")}>
          <h3 className={H3}>
            Resultado em <span className="font-mono tabular-nums">{years}</span> {years === 1 ? "ano" : "anos"}
          </h3>
          {/* Os números animados são aria-hidden; o texto sr-only traz o valor assentado. */}
          <div aria-live="polite" aria-atomic="true">
            <p className="sr-only">Resultado em {formatYears(announced.years)}.</p>
            <dl className="mt-5 grid border-b border-white/8 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="relative col-span-full border-t border-white/8 py-5 @container">
                <span
                  aria-hidden="true"
                  className="absolute -top-px left-0 h-px w-24 bg-bull-gradient shadow-[0_0_10px_rgb(245_158_11/0.65)]"
                />
                <dt className={RESULT_LABEL}>
                  <StrategyKey className="-translate-y-1" />
                  {/* O número grande vem de uma taxa hipotética: o rótulo diz isso, não só o aviso. */}
                  <span>
                    {SIMULATOR.strategyLabel}
                    <span className="mt-0.5 block text-xs text-muted">
                      cenário hipotético ·{" "}
                      <span className="font-mono tabular-nums">{formatAnnualRate(SIMULATOR.strategyAnnualRate)}</span>
                    </span>
                  </span>
                </dt>
                <dd className="mt-3">
                  <AnimatedCurrency
                    splitSymbol
                    value={simulation.strategyFinal}
                    className={`${FIGURE} text-[min(14cqi,3.5rem)]`}
                  />
                  <span className="sr-only">{formatBRL(announced.strategyFinal)}</span>
                </dd>
              </div>
              <div className="border-t border-white/8 py-5 @container sm:pr-5 lg:pr-0 xl:pr-5">
                <dt className={RESULT_LABEL}>
                  <SavingsKey className="-translate-y-1" />
                  {SIMULATOR.savingsLabel}
                </dt>
                <dd className="mt-3">
                  <AnimatedCurrency
                    splitSymbol
                    value={simulation.savingsFinal}
                    className={`${FIGURE} text-[min(13cqi,2rem)]`}
                  />
                  <span className="sr-only">{formatBRL(announced.savingsFinal)}</span>
                </dd>
              </div>
              <div className="border-t border-white/8 py-5 @container sm:border-l sm:pl-5 lg:border-l-0 lg:pl-0 xl:border-l xl:pl-5">
                <dt className={RESULT_LABEL}>
                  <BandKey className="translate-y-px" />
                  Diferença no período
                </dt>
                <dd className="mt-3">
                  <AnimatedCurrency
                    splitSymbol
                    value={simulation.difference}
                    className={`${FIGURE} text-[min(13cqi,2rem)]`}
                  />
                  <span className="sr-only">{formatBRL(announced.difference)}</span>
                </dd>
              </div>
              <div className="col-span-full flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-white/8 py-4">
                <dt className="text-sm text-muted">
                  Total aportado <span className="text-xs">(sem rendimentos)</span>
                </dt>
                <dd>
                  <AnimatedCurrency value={simulation.contributed} className={`${FIGURE} text-lg sm:text-xl`} />
                  <span className="sr-only">{formatBRL(announced.contributed)}</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Gráfico */}
        <div
          className={cn(
            CELL,
            "flex min-w-0 flex-col border-t border-white/8",
            "lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:border-t-0 lg:border-l",
          )}
        >
          <h3 className={H3}>Evolução do patrimônio</h3>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm sm:flex-row sm:flex-wrap sm:gap-x-6">
            <li className="flex items-baseline gap-2.5">
              <StrategyKey className="-translate-y-1" />
              <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <span className="text-led">{SIMULATOR.strategyLabel}</span>
                <span className="text-xs text-muted">
                  <span className="font-mono tabular-nums">{formatAnnualRate(SIMULATOR.strategyAnnualRate)}</span>{" "}
                  hipotético
                </span>
              </span>
            </li>
            <li className="flex items-baseline gap-2.5">
              <SavingsKey className="-translate-y-1" />
              <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <span className="text-led">{SIMULATOR.savingsLabel}</span>
                <span className="font-mono text-xs text-muted tabular-nums">
                  {formatAnnualRate(SIMULATOR.savingsAnnualRate)}
                </span>
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <BandKey />
              <span className="text-led">Diferença no período</span>
            </li>
          </ul>

          <div className="mt-6">
            <WealthChart savings={simulation.savings} strategy={simulation.strategy} years={simulation.years} />
          </div>

          <div className="mt-8">
            <YearTable simulation={simulation} />
          </div>

          {/* Aviso antes da ação: quem clica já leu as premissas. No lg, encosta no pé do painel. */}
          <div className="mt-6 lg:mt-auto lg:pt-8">
            <p className="max-w-[62ch] text-xs leading-relaxed text-muted">{SIMULATOR.disclaimer}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <CtaLink
                variant="gold"
                size="lg"
                href={CTA_HREF}
                external
                aria-describedby={ids.ctaHint}
                className="w-full shrink-0 sm:w-auto"
              >
                <WhatsAppIcon className="size-5 shrink-0" />
                Quero montar meu plano
              </CtaLink>
              <p id={ids.ctaHint} className="text-xs text-muted">
                Abre o WhatsApp com uma mensagem pronta para a equipe Nexfort.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
