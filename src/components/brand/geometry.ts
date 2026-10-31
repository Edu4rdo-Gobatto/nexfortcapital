/**
 * Geometria vetorial do emblema Nexfort (Torre de xadrez + Touro em espaço negativo).
 * Todas as coordenadas vivem no mesmo espaço: viewBox "0 0 160 240".
 * Compartilhada entre o logo estático (NexfortLogo) e a versão animada (RookBullCenterpiece).
 */

export const EMBLEM_VIEWBOX = "0 0 160 240";
export const EMBLEM_WIDTH = 160;
export const EMBLEM_HEIGHT = 240;

/** Silhueta fechada da torre (ameias, colar, coluna côncava e base). Use como fill e como clipPath. */
export const ROOK_PATH =
  "M28 10H48V20H56V10H76V20H84V10H104V20H112V10H132V34H138Q143 34 143 39Q143 44 138 44H128V52H124C124 120 130 170 136 196H142Q147 196 147 201Q147 206 142 206H146Q152 206 152 212V222Q152 230 144 231Q80 238 16 231Q8 230 8 222V212Q8 206 14 206H18Q13 206 13 201Q13 196 18 196H24C30 170 36 120 36 52H32V44H22Q17 44 17 39Q17 34 22 34H28Z";

/** Touro investindo para a direita, já posicionado no espaço da torre. Recorte com ROOK_PATH. */
export const BULL_PATH =
  "M90.4 132.6C97.2 132.6 102.9 134.8 106.4 139.4C108.6 141.7 110.9 144 113.2 146.2C116.6 142.8 121.2 139.4 124.6 137.1C128 134.8 130.3 132.6 132.6 131.4C131.4 136 129.2 139.4 126.9 141.7C124.6 145.1 122.3 147.4 121.2 149.7C123.5 157.6 126.9 166.8 129.2 173.6C130.3 177 131.4 179.3 131.4 180.4C131.4 183.9 129.2 186.1 125.7 186.1C123.5 186.1 121.2 185 118.9 183.9C116.6 182.7 114.3 182.7 112.1 182.7C109.8 183.9 108.6 186.1 107.5 188.4L110.9 195.3L114.3 202.1L107.5 202.1L102.9 195.3C101.8 191.8 100.7 189.6 98.4 188.4C89.3 190.7 76.7 188.4 67.6 183.9C65.3 182.7 64.2 181.6 63 180.4L59.6 188.4L48.2 202.1L40.2 202.1L43.7 191.8C39.1 188.4 36.8 183.9 36.8 178.2C35.7 171.3 35.7 164.5 36.8 157.6C36.8 153.1 38 150.8 39.1 148.5C35.7 144 31.1 138.3 27.7 131.4C30 131.4 32.3 134.8 34.5 138.3C36.8 141.7 39.1 144 41.4 144C56.2 144 74.4 134.8 90.4 132.6Z";

/** Caixa do touro no espaço do emblema (para gradientes userSpaceOnUse, varreduras e partículas). */
export const BULL_BOUNDS = { x: 27.7, y: 131.4, width: 104.9, height: 70.7 } as const;

/**
 * Traços abertos da torre na ordem de construção, para o desenho via pathLength / stroke-dashoffset:
 * ameias → coluna → base → detalhes internos.
 */
export const ROOK_STROKES = {
  battlement:
    "M22 44Q17 44 17 39Q17 34 22 34H28V10H48V20H56V10H76V20H84V10H104V20H112V10H132V34H138Q143 34 143 39Q143 44 138 44",
  columnLeft: "M32 44V52H36C36 120 30 170 24 196",
  columnRight: "M128 44V52H124C124 120 130 170 136 196",
  base: "M24 196H18Q13 196 13 201Q13 206 18 206H14Q8 206 8 212V222Q8 230 16 231Q80 238 144 231Q152 230 152 222V212Q152 206 146 206H142Q147 206 147 201Q147 196 142 196H136",
  details: ["M28 34H132", "M32 44H128", "M36 52H124", "M24 196H136", "M18 206H142"],
} as const;

/** Friso de luz sob o colar (detalhe da logo original). */
export const ROOK_GROOVE_PATH = "M33 48H127";
