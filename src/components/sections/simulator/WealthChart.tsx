"use client";

import { useId, useMemo, useState, type PointerEvent } from "react";
import { motion, type Variants } from "motion/react";
import { SIMULATOR } from "@/content/nexfort";
import { EASE_OUT_EXPO } from "@/lib/animations";
import { formatBRL, formatBRLCompact } from "@/lib/finance";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/utils";
import { PLOT, VIEW_H, VIEW_W, buildChartModel, percentX, percentY } from "./chart-geometry";
import { SAVINGS_DASH, SAVINGS_STROKE, SavingsKey, StrategyKey } from "./keys";
import { formatAnnualRate, formatYears } from "./simulation";

/** Hex dos tokens de globals.css (atributos SVG não leem var() de forma confiável). */
const GOLD = "#F59E0B";
const EMBER = "#EA580C";
const CRIMSON = "#B91C1C";
const LED = "#F8FAFC";

/** Região generosa para filtros e máscaras: o brilho não é cortado nas bordas do viewBox. */
const REGION = { x: -48, y: -48, width: VIEW_W + 96, height: VIEW_H + 96 } as const;

/** Entra uma vez, quando 40% do gráfico está visível. */
const CHART_VIEWPORT = { once: true, amount: 0.4 };

/** O rótulo da poupança fica abaixo do marcador final, salvo quando ele encosta na base. */
const LABEL_BELOW_MIN = 0.18;
/** No celular, o penúltimo ano some se ficar a menos disto (fração do eixo) do rótulo "N anos". */
const CROWDED_TICK_GAP = 0.24;

/**
 * Entrada do gráfico, uma única vez: as curvas se desenham (pathLength 0 → 1 nas máscaras de
 * revelação), a faixa da diferença acende (opacity) e os marcadores finais aparecem (opacity).
 * Com movimento reduzido, tudo é instantâneo. Mudanças nos controles trocam o `d` direto, sem tween.
 */
function chartVariants(reduceMotion: boolean) {
  const draw = (delay: number): Variants => ({
    hidden: { pathLength: 0 },
    visible: {
      pathLength: 1,
      transition: reduceMotion ? { duration: 0 } : { duration: 1.8, ease: EASE_OUT_EXPO, delay },
    },
  });
  const fade = (delay: number, duration: number): Variants => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: reduceMotion ? { duration: 0 } : { duration, ease: EASE_OUT_EXPO, delay },
    },
  });
  return { savings: draw(0.1), strategy: draw(0.25), band: fade(0.9, 1.2), markers: fade(1.35, 0.5) };
}

type WealthChartProps = {
  /** Séries anuais (índice 0 = hoje), com `years + 1` pontos cada. */
  savings: readonly number[];
  strategy: readonly number[];
  years: number;
};

export function WealthChart({ savings, strategy, years }: WealthChartProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = {
    stroke: `${uid}-stroke`,
    band: `${uid}-band`,
    glow: `${uid}-glow`,
    revealSavings: `${uid}-reveal-savings`,
    revealStrategy: `${uid}-reveal-strategy`,
  };

  const reduceMotion = usePrefersReducedMotion(); // ao vivo; só altera transições, nunca a marcação inicial
  const variants = useMemo(() => chartVariants(Boolean(reduceMotion)), [reduceMotion]);
  const model = useMemo(() => buildChartModel(savings, strategy), [savings, strategy]);

  // Ano sob o cursor/dedo. Os valores de todos os anos também estão na tabela (YearTable).
  const [scrub, setScrub] = useState<number | null>(null);
  const active = scrub === null ? null : Math.min(scrub, years);

  const last = model.strategy.length - 1;
  const strategyEnd = model.strategy[last];
  const savingsEnd = model.savings[last];
  const strategyFinal = strategy[last] ?? 0;
  const savingsFinal = savings[last] ?? 0;
  const hasValues = strategyFinal > 0;
  const savingsLabelBelow = (PLOT.bottom - savingsEnd[1]) / (PLOT.bottom - PLOT.top) > LABEL_BELOW_MIN;
  // Rótulos finais compactos ("R$ 1,2 mi"); se os dois arredondarem igual, valores completos.
  const compactLabels = formatBRLCompact(strategyFinal) !== formatBRLCompact(savingsFinal);
  const endLabel = compactLabels ? formatBRLCompact : formatBRL;

  const summary =
    `Gráfico da simulação em ${formatYears(years)}. ` +
    `${SIMULATOR.strategyLabel} (cenário hipotético de ${formatAnnualRate(SIMULATOR.strategyAnnualRate)}): ` +
    `${formatBRL(strategyFinal)} ao final. ` +
    `${SIMULATOR.savingsLabel}: ${formatBRL(savingsFinal)} ao final.`;

  function handlePointer(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_W;
    const progress = (x - PLOT.left) / (PLOT.right - PLOT.left);
    setScrub(Math.min(years, Math.max(0, Math.round(progress * years))));
  }

  function clearScrub() {
    setScrub(null);
  }

  return (
    <motion.div
      role="img"
      aria-label={summary}
      initial="hidden"
      whileInView="visible"
      viewport={CHART_VIEWPORT}
      className="relative pt-5"
    >
      <div className="relative aspect-16/11 w-full">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
        >
          <defs>
            {/* Onda de calor do touro ao longo da subida: carmesim → âmbar → ouro. */}
            <linearGradient
              id={ids.stroke}
              gradientUnits="userSpaceOnUse"
              x1={PLOT.left}
              y1={PLOT.bottom}
              x2={PLOT.right}
              y2={PLOT.top}
            >
              <stop offset="0" stopColor={CRIMSON} />
              <stop offset="0.35" stopColor={EMBER} />
              <stop offset="0.8" stopColor={GOLD} />
            </linearGradient>
            <linearGradient id={ids.band} gradientUnits="userSpaceOnUse" x1="0" y1={PLOT.top} x2="0" y2={PLOT.bottom}>
              <stop offset="0" stopColor={GOLD} stopOpacity={0.26} />
              <stop offset="1" stopColor={GOLD} stopOpacity={0.03} />
            </linearGradient>
            <filter id={ids.glow} filterUnits="userSpaceOnUse" {...REGION}>
              <feGaussianBlur stdDeviation={5} />
            </filter>
            {/* Máscaras de revelação: o traço branco largo é que "desenha" (pathLength). */}
            <mask id={ids.revealSavings} maskUnits="userSpaceOnUse" {...REGION}>
              <motion.path
                d={model.savingsPath}
                fill="none"
                stroke="#fff"
                strokeWidth={44}
                strokeLinecap="butt"
                strokeLinejoin="round"
                variants={variants.savings}
              />
            </mask>
            <mask id={ids.revealStrategy} maskUnits="userSpaceOnUse" {...REGION}>
              <motion.path
                d={model.strategyPath}
                fill="none"
                stroke="#fff"
                strokeWidth={44}
                strokeLinecap="butt"
                strokeLinejoin="round"
                variants={variants.strategy}
              />
            </mask>
          </defs>

          {/* Grade recessiva: linhas sólidas finas (nunca tracejadas) e a linha de base. */}
          {model.ticks.map(({ value, y }) => (
            <line
              key={value}
              x1={0}
              x2={VIEW_W}
              y1={y}
              y2={y}
              stroke={LED}
              strokeOpacity={0.07}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <line
            x1={0}
            x2={VIEW_W}
            y1={PLOT.bottom}
            y2={PLOT.bottom}
            stroke={LED}
            strokeOpacity={0.2}
            vectorEffect="non-scaling-stroke"
          />

          {/* A diferença entre os cenários: o "efeito" cresce com o tempo. */}
          <motion.path d={model.bandPath} fill={`url(#${ids.band})`} variants={variants.band} />

          <g mask={`url(#${ids.revealSavings})`}>
            <path
              d={model.savingsPath}
              fill="none"
              stroke={SAVINGS_STROKE}
              strokeOpacity={0.85}
              strokeWidth={2}
              strokeDasharray={SAVINGS_DASH}
              vectorEffect="non-scaling-stroke"
            />
          </g>
          <g mask={`url(#${ids.revealStrategy})`}>
            <path
              d={model.strategyPath}
              fill="none"
              stroke={GOLD}
              strokeOpacity={0.55}
              strokeWidth={6}
              filter={`url(#${ids.glow})`}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={model.strategyPath}
              fill="none"
              stroke={`url(#${ids.stroke})`}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </svg>

        {/* Eixo Y: 3 ou 4 valores redondos, sobre as linhas de grade. */}
        {model.ticks.map(({ value, y }) => (
          <span
            key={value}
            className="pointer-events-none absolute left-0 -translate-y-full pb-1 font-mono text-[10px] whitespace-nowrap text-muted tabular-nums sm:text-[11px]"
            style={{ top: percentY(y) }}
          >
            <span className="bg-concrete/80 px-1">{formatBRLCompact(value)}</span>
          </span>
        ))}

        {/* Marcadores e rótulos finais (somem enquanto o cursor percorre o gráfico). */}
        {hasValues ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out-expo",
              active !== null && "opacity-0",
            )}
          >
            <motion.span
              variants={variants.markers}
              className="absolute"
              style={{ left: percentX(savingsEnd[0]), top: percentY(savingsEnd[1]) }}
            >
              <span className="block size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-muted shadow-[0_0_0_2px_var(--color-concrete)]" />
            </motion.span>
            <motion.span
              variants={variants.markers}
              className="absolute"
              style={{ left: percentX(strategyEnd[0]), top: percentY(strategyEnd[1]) }}
            >
              <span className="block size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold shadow-[0_0_0_2px_var(--color-concrete),0_0_16px_rgb(245_158_11/0.9)]" />
            </motion.span>
            <motion.span
              variants={variants.markers}
              className="absolute right-0 -translate-y-full pb-3"
              style={{ top: percentY(strategyEnd[1]) }}
            >
              <span className="block bg-concrete/85 px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-led tabular-nums sm:text-xs">
                {endLabel(strategyFinal)}
              </span>
            </motion.span>
            <motion.span
              variants={variants.markers}
              className={cn("absolute right-0", savingsLabelBelow ? "pt-3" : "-translate-y-full pb-3")}
              style={{ top: percentY(savingsEnd[1]) }}
            >
              <span className="block bg-concrete/85 px-1.5 py-0.5 font-mono text-[11px] whitespace-nowrap text-muted tabular-nums sm:text-xs">
                {endLabel(savingsFinal)}
              </span>
            </motion.span>
          </div>
        ) : null}

        {/* Cursor: linha de LED no ano mais próximo + leitura dos dois cenários. */}
        {active !== null ? (
          <div className="pointer-events-none absolute inset-0">
            <span
              className="absolute w-px -translate-x-1/2 bg-led/75 shadow-[0_0_10px_rgb(248_250_252/0.55)]"
              style={{
                left: percentX(model.strategy[active][0]),
                top: percentY(PLOT.top),
                bottom: `${100 - (PLOT.bottom / VIEW_H) * 100}%`,
              }}
            />
            <span
              className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-muted shadow-[0_0_0_2px_var(--color-concrete)]"
              style={{ left: percentX(model.savings[active][0]), top: percentY(model.savings[active][1]) }}
            />
            <span
              className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold shadow-[0_0_0_2px_var(--color-concrete),0_0_14px_rgb(245_158_11/0.9)]"
              style={{ left: percentX(model.strategy[active][0]), top: percentY(model.strategy[active][1]) }}
            />
            <div className="absolute inset-x-0 top-0 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/10 bg-ink/85 px-2 py-1.5 font-mono text-[11px] tabular-nums sm:text-xs">
              <span className="text-muted">{active === 0 ? "Hoje" : `Ano ${active}`}</span>
              <span className="flex items-center gap-2">
                <StrategyKey className="w-3" />
                <span className="text-led">{formatBRL(strategy[active] ?? 0)}</span>
                <span className="hidden font-sans text-muted sm:inline">Nexfort</span>
              </span>
              <span className="flex items-center gap-2">
                <SavingsKey className="w-3" />
                <span className="text-led">{formatBRL(savings[active] ?? 0)}</span>
                <span className="hidden font-sans text-muted sm:inline">Poupança</span>
              </span>
            </div>
          </div>
        ) : null}

        {/* Superfície do ponteiro: mouse/caneta ao passar, dedo ao arrastar na horizontal (rolagem vertical e
            zoom por pinça continuam com o navegador: os rótulos do gráfico são pequenos). */}
        <div
          className="absolute inset-0 cursor-crosshair touch-pan-y touch-pinch-zoom"
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={clearScrub}
          onPointerCancel={clearScrub}
        />
      </div>

      {/* Eixo X: anos. */}
      <div aria-hidden="true" className="relative mt-3 h-4 font-mono text-[10px] text-muted tabular-nums sm:text-[11px]">
        {model.years.map(({ value, x }, index) => {
          const first = index === 0;
          const lastTick = index === model.years.length - 1;
          const crowded = !first && index === model.years.length - 2 && (years - value) / years < CROWDED_TICK_GAP;
          return (
            <span
              key={value}
              className={cn(
                "absolute top-0 whitespace-nowrap",
                first ? "left-0" : lastTick ? "right-0" : "-translate-x-1/2",
                crowded && "max-sm:hidden",
              )}
              style={first || lastTick ? undefined : { left: percentX(x) }}
            >
              {first ? "Hoje" : lastTick ? formatYears(value) : value}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}
