import { BAND_EDGE } from "./band";
import { WithNumerals } from "./numerals";

type BandCaptionProps = {
  /** Texto à esquerda (ex.: "1ª à 6ª Edição consolidada"). Sem ele, a linha só reserva altura. */
  caption?: string;
  /** Texto à direita, em ouro, sob o merlão tracejado (ex.: "Próxima edição"). */
  aside?: string;
};

/**
 * Linha de legenda sob as faixas dos programas. Sempre renderizada (mesmo vazia) para que
 * a coroa, os indicadores e a cópia de medida do painel tenham exatamente a mesma altura.
 */
export function BandCaption({ caption, aside }: BandCaptionProps) {
  return (
    <div
      className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 text-xs leading-none sm:text-sm"
      style={{ paddingInline: BAND_EDGE }}
    >
      {caption ? (
        <p className="text-muted">
          <WithNumerals text={caption} />
        </p>
      ) : (
        <span aria-hidden="true">{" "}</span>
      )}
      {aside ? <p className="text-gold">{aside}</p> : null}
    </div>
  );
}
