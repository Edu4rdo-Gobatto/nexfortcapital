import { TORRE_HEIGHT } from "./geometry";

/**
 * As três partes da Torre, que são as três etapas do método (o slogan da Nexfort):
 * a base é "Organize", o corpo é "Multiplique" e a coroa é "Tenha liberdade".
 *
 * Os cortes ficam onde a peça já tem uma junta desenhada: o gargalo acima do plinto e o topo do fuste, sob o
 * colar da coroa (y do perfil, em unidades 3D; a Torre é centrada em y = 0).
 */
export const TORRE_CUTS = { base: -0.837, crown: 0.543 } as const;

/** Vão que abre entre as partes quando a Torre se desmonta por inteiro (unidades 3D). */
export const EXPLODE_GAP = 0.2;

/** Altura da Torre desmontada: é ela que ocupa a âncora no bloco do método. */
export const EXPLODED_HEIGHT = TORRE_HEIGHT + 2 * EXPLODE_GAP;

const top = EXPLODED_HEIGHT / 2;
const fromTop = (y: number) => (top - y) / EXPLODED_HEIGHT;

/**
 * Centro vertical de cada parte na Torre desmontada, como fração da altura a partir do topo. Os rótulos das
 * etapas (HTML, sobre a âncora) ficam nestas alturas, na ordem do método: de baixo para cima.
 */
export const PART_CENTERS = {
  base: fromTop((-TORRE_HEIGHT / 2 + TORRE_CUTS.base) / 2 - EXPLODE_GAP),
  body: fromTop((TORRE_CUTS.base + TORRE_CUTS.crown) / 2),
  crown: fromTop((TORRE_CUTS.crown + TORRE_HEIGHT / 2) / 2 + EXPLODE_GAP),
} as const;

/** Até onde cada etapa enche a Torre fechada, de baixo para cima (0..1): o medidor do diagnóstico. */
export const PART_LEVELS = {
  base: (TORRE_CUTS.base + TORRE_HEIGHT / 2) / TORRE_HEIGHT,
  body: (TORRE_CUTS.crown + TORRE_HEIGHT / 2) / TORRE_HEIGHT,
  crown: 1,
} as const;
