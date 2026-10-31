import { SIMULATOR } from "@/content/nexfort";
import { projectWealth, totalContributed } from "@/lib/finance";

/**
 * Modelo puro do simulador "O Efeito Nexfort". A matemática e as taxas vêm de
 * lib/finance e de SIMULATOR (content/nexfort): aqui só organizamos os resultados.
 */

export type SimulationInput = {
  initial: number;
  monthly: number;
  years: number;
};

export type Simulation = SimulationInput & {
  /** Patrimônio ao fim de cada ano (índice 0 = hoje), `years + 1` pontos. */
  savings: number[];
  strategy: number[];
  /** Total aportado acumulado ao fim de cada ano (sem rendimentos). */
  contributions: number[];
  savingsFinal: number;
  strategyFinal: number;
  difference: number;
  contributed: number;
};

export const DEFAULT_INPUT: SimulationInput = {
  initial: SIMULATOR.initial.default,
  monthly: SIMULATOR.monthly.default,
  years: SIMULATOR.years.default,
};

export function simulate(input: SimulationInput): Simulation {
  const { initial, monthly, years } = input;
  const savings = projectWealth(initial, monthly, SIMULATOR.savingsAnnualRate, years);
  const strategy = projectWealth(initial, monthly, SIMULATOR.strategyAnnualRate, years);
  const contributions = savings.map((_, year) => totalContributed(initial, monthly, year));
  const savingsFinal = savings[savings.length - 1] ?? initial;
  const strategyFinal = strategy[strategy.length - 1] ?? initial;

  return {
    ...input,
    savings,
    strategy,
    contributions,
    savingsFinal,
    strategyFinal,
    // A partir dos valores já arredondados para reais: a conta exibida sempre fecha.
    difference: Math.round(strategyFinal) - Math.round(savingsFinal),
    contributed: totalContributed(initial, monthly, years),
  };
}

const percent = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 2 });

/** 0.0617 → "6,17% a.a." */
export function formatAnnualRate(rate: number) {
  return `${percent.format(rate)} a.a.`;
}

/** 1 → "1 ano", 10 → "10 anos" */
export function formatYears(years: number) {
  return `${years} ${years === 1 ? "ano" : "anos"}`;
}
