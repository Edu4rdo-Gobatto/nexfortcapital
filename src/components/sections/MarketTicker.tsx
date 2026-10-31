import { TickerBand } from "@/components/sections/ticker/TickerBand";
import { TickerList } from "@/components/sections/ticker/TickerList";

/**
 * Faixa diagonal (diagonal_ticker): os pilares de autoridade da Nexfort em loop contínuo,
 * inclinada como o corte de LED da fachada. Server Component: só a casca (TickerBand) é client.
 */
export function MarketTicker() {
  return (
    <TickerBand label="Áreas de atuação da Nexfort Capital">
      <TickerList />
      <TickerList decorative />
    </TickerBand>
  );
}
