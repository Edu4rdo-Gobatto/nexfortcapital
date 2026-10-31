/** Taxa mensal equivalente a uma taxa anual efetiva (ex.: 0.0617 → ~0.005). */
export function monthlyRateFromAnnual(annualRate: number) {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

/**
 * Patrimônio ao fim de cada ano (índice 0 = hoje), com juros compostos mensais
 * e aporte no fim de cada mês. Retorna `years + 1` pontos.
 */
export function projectWealth(initial: number, monthlyContribution: number, annualRate: number, years: number) {
  const rate = monthlyRateFromAnnual(annualRate);
  const series = [initial];
  let balance = initial;
  for (let month = 1; month <= years * 12; month++) {
    balance = balance * (1 + rate) + monthlyContribution;
    if (month % 12 === 0) series.push(balance);
  }
  return series;
}

/** Total investido do próprio bolso (sem rendimentos). */
export function totalContributed(initial: number, monthlyContribution: number, years: number) {
  return initial + monthlyContribution * years * 12;
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** R$ 1.234.567 */
export function formatBRL(value: number) {
  return brl.format(Math.round(value));
}

/** R$ 1,2 mi */
export function formatBRLCompact(value: number) {
  return brlCompact.format(value);
}
