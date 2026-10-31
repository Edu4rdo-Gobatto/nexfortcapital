/**
 * Espaço de desenho comum às faixas dos programas (coroa da ITM e indicadores do Finance Pro).
 * A mesma proporção + a mesma linha de legenda (BandCaption) garantem painéis de altura igual.
 */
export const BAND_VIEW = { w: 640, h: 124 } as const;

/** Recuo (em unidades do desenho) do bloco das ameias; as legendas alinham-se a ele. */
export const BAND_INSET = 20;

/** O mesmo recuo em % da largura, para posicionar HTML sobre/sob o SVG. */
export const BAND_EDGE = `${(BAND_INSET / BAND_VIEW.w) * 100}%`;

export const NEXT_EDITION = "Próxima edição";
