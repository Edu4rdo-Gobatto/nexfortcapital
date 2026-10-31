import { Fragment } from "react";

// Algarismos (com decimais e %): "1", "5,0", "12%". O indicador ordinal (ª/º) fica de fora de propósito:
// na mono ele ocupa uma célula inteira e se descola do número ("1 ª").
const NUMERAL = /(\d+(?:[.,]\d+)*%?)/;

/**
 * Mantém a fonte do texto e troca só os algarismos por JetBrains Mono tabular
 * (regra da marca: todo número em mono). Ex.: "1ª à 6ª Edição consolidada".
 */
export function WithNumerals({ text }: { text: string }) {
  // split com grupo de captura: índices ímpares são os números encontrados.
  const parts = text.split(NUMERAL);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="font-mono tabular-nums">
            {part}
          </span>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
