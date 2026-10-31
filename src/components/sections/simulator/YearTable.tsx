import { ChevronDown } from "lucide-react";
import { SIMULATOR } from "@/content/nexfort";
import { formatBRL } from "@/lib/finance";
import { formatAnnualRate, type Simulation } from "./simulation";

// Sem "use client": marcação pura, renderizada pelo SimulatorConsole (cliente).

type YearTableProps = {
  simulation: Simulation;
};

/**
 * Versão em tabela do gráfico: todos os valores anuais, acessíveis por teclado e leitores de tela
 * (o cursor sobre o gráfico só complementa). Fechada por padrão para não alongar a seção.
 */
export function YearTable({ simulation }: YearTableProps) {
  const { savings, strategy, contributions } = simulation;

  return (
    <details className="group border-t border-white/8 pt-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-led focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold [&::-webkit-details-marker]:hidden">
        Ver valores ano a ano
        <ChevronDown className="size-4 shrink-0 text-muted group-open:rotate-180 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out-expo" />
      </summary>
      <table className="mt-4 w-full border-collapse text-xs sm:text-sm">
        <caption className="sr-only">
          Patrimônio ao fim de cada ano: {SIMULATOR.savingsLabel} a {formatAnnualRate(SIMULATOR.savingsAnnualRate)} e{" "}
          {SIMULATOR.strategyLabel} no cenário hipotético de {formatAnnualRate(SIMULATOR.strategyAnnualRate)}
        </caption>
        <thead>
          <tr className="text-muted">
            <th scope="col" className="pr-3 pb-2 text-left font-medium">
              Ano
            </th>
            <th scope="col" className="px-2 pb-2 text-right font-medium">
              Poupança
            </th>
            <th scope="col" className="px-2 pb-2 text-right font-medium">
              Nexfort
            </th>
            <th scope="col" className="hidden pb-2 pl-2 text-right font-medium sm:table-cell">
              Aportado
            </th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {savings.map((value, year) => (
            <tr key={year} className="border-t border-white/6">
              <th scope="row" className="py-1.5 pr-3 text-left font-normal text-muted">
                {year === 0 ? "Hoje" : year}
              </th>
              <td className="px-2 py-1.5 text-right text-muted">{formatBRL(value)}</td>
              <td className="px-2 py-1.5 text-right text-led">{formatBRL(strategy[year] ?? 0)}</td>
              <td className="hidden py-1.5 pl-2 text-right text-muted sm:table-cell">
                {formatBRL(contributions[year] ?? 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
