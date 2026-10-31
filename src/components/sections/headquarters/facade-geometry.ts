/**
 * Elevação noturna estilizada da sede (Av. Das Artes, 253), num viewBox de 1200 × 900.
 * Escala aproximada: 1 m ≈ 50 unidades. A fita de LED desce a 32° (o mesmo --facade-angle
 * de globals.css) do topo do pórtico de vidro até o pé da rampa de acessibilidade.
 * Módulo puro (sem "use client"): usado pelo SVG do servidor e pelas ilhas animadas.
 */
import { EMBLEM_HEIGHT, EMBLEM_WIDTH } from "@/components/brand/geometry";

export const FACADE_WIDTH = 1200;
export const FACADE_HEIGHT = 900;
export const FACADE_VIEWBOX = `0 0 ${FACADE_WIDTH} ${FACADE_HEIGHT}`;

export const LED_ANGLE = 32;
const SLOPE = Math.tan((LED_ANGLE * Math.PI) / 180); // ≈ 0,625

/** Uma casa decimal: coordenadas legíveis e markup enxuto. */
const r1 = (value: number) => Math.round(value * 10) / 10;

// Níveis e prumadas ------------------------------------------------------------------------------

/** Monólito alto: oito fiadas de placas (90 u) entre o topo e a calçada. */
export const BUILDING = { left: 60, right: 1140, top: 50 } as const;
/** Calçada (base do volume). */
export const GROUND_Y = 770;
/** Piso interno e patamar de entrada: três degraus baixos acima da calçada. */
export const FLOOR_Y = 740;
/** Topo do pórtico de vidro, onde corre o trecho horizontal da fita. */
export const LED_Y = 410;
/** Face interna do pilar esquerdo do pórtico. */
export const PORTICO_LEFT = 112;
/** Onde a fita dobra e começa a descer. */
export const LED_CORNER_X = 465;

const diagonalX = (y: number) => LED_CORNER_X + (y - LED_Y) / SLOPE;

/** Fim do pano de vidro: onde a diagonal encontra o piso. */
export const GLASS_END_X = r1(diagonalX(FLOOR_Y));
/** Fim da fita: pé da rampa, rente à calçada. */
export const LED_END_X = r1(diagonalX(GROUND_Y));

export const BUILDING_PATH = `M${BUILDING.left} ${BUILDING.top}H${BUILDING.right}V${GROUND_Y}H${BUILDING.left}Z`;
export const GLASS_PATH = `M${PORTICO_LEFT} ${LED_Y}H${LED_CORNER_X}L${GLASS_END_X} ${FLOOR_Y}H${PORTICO_LEFT}Z`;
export const LED_PATH = `M${PORTICO_LEFT} ${LED_Y}H${LED_CORNER_X}L${LED_END_X} ${GROUND_Y}`;

// Concreto aparente: placas de 2,7 × 1,8 m com seis furos de tirante ----------------------------

export const PANEL = { width: 135, height: 90 } as const;
export const TIE_HOLES = [
  [22.5, 22.5],
  [67.5, 22.5],
  [112.5, 22.5],
  [22.5, 67.5],
  [67.5, 67.5],
  [112.5, 67.5],
] as const;

// Pano de vidro ----------------------------------------------------------------------------------

const MULLION_STEP = 56;
const MULLIONS = Array.from({ length: 16 }, (_, i) => PORTICO_LEFT + MULLION_STEP * (i + 1)).filter(
  (x) => x < GLASS_END_X - 12,
);

/** Montantes verticais (o recorte do vidro apara o topo de cada um). */
export const MULLIONS_PATH = MULLIONS.map((x) => `M${x} ${LED_Y}V${FLOOR_Y}`).join("");
/** Reflexo fino no lado esquerdo de cada montante. */
export const MULLION_SHEEN_PATH = MULLIONS.map((x) => `M${x - 1.1} ${LED_Y}V${FLOOR_Y}`).join("");

/** Laje do mezanino, vista através do vidro (pé-direito duplo). */
export const MEZZANINE = { top: 562, bottom: 576 } as const;
/** Travessas: alinhada ao mezanino e na altura da porta. */
export const TRANSOMS_PATH = `M${PORTICO_LEFT} 569H${GLASS_END_X}M${PORTICO_LEFT} 620H${GLASS_END_X}`;

/**
 * Porta dupla de vidro entre dois montantes. Fica à direita de x = 300 porque, no celular,
 * a ilustração é recortada em 1:1 ancorada à direita (x 300 → 1200).
 */
export const DOOR = { left: 336, right: 448, top: 620 } as const;
const DOOR_CENTER = (DOOR.left + DOOR.right) / 2;
export const DOOR_FRAME_PATH = `M${DOOR.left} ${FLOOR_Y}V${DOOR.top}H${DOOR.right}V${FLOOR_Y}M${DOOR_CENTER} ${DOOR.top}V${FLOOR_Y}`;
export const DOOR_HANDLES_PATH = `M${DOOR_CENTER - 7} 654V702M${DOOR_CENTER + 7} 654V702`;

/** Cones de luz quente sob o mezanino. */
export const DOWNLIGHTS = [210, 556, 760] as const;
export const downlightPath = (x: number) =>
  `M${x - 5} ${MEZZANINE.bottom}H${x + 5}L${x + 46} ${FLOOR_Y}H${x - 46}Z`;

/** Balcão de recepção, em silhueta. */
export const DESK = { left: 500, right: 610, top: 714 } as const;

/** Poça de luz do saguão na calçada, em frente à porta. */
export const LOBBY_LIGHT_X = DOOR_CENTER;

/** Reflexos inclinados no vidro. */
export const GLASS_STREAKS = [
  "M300 410H352L214 740H162Z",
  "M598 470H626L522 740H494Z",
  "M812 600H880L820 740H752Z",
] as const;

// Degraus, rampa e corrimãos ---------------------------------------------------------------------

export const STEP_RISE = 10;
/** Três degraus centrados na porta, cada um um pouco mais largo (leitura de profundidade). */
export const STEPS = [
  { y: FLOOR_Y, left: DOOR_CENTER - 80, right: DOOR_CENTER + 80, fill: "#252A35" },
  { y: FLOOR_Y + STEP_RISE, left: DOOR_CENTER - 90, right: DOOR_CENTER + 90, fill: "#2A2F3B" },
  { y: FLOOR_Y + STEP_RISE * 2, left: DOOR_CENTER - 100, right: DOOR_CENTER + 100, fill: "#2F3541" },
] as const;

/** Rampa de ~7,5% que sobe do pé da fita até o patamar. */
export const RAMP_TOP_X = 640;
const RAMP_SLOPE = (GROUND_Y - FLOOR_Y) / (LED_END_X - RAMP_TOP_X);
const rampY = (x: number) => FLOOR_Y + (x - RAMP_TOP_X) * RAMP_SLOPE;

export const RAMP_SIDE_PATH = `M${RAMP_TOP_X} ${FLOOR_Y}L${LED_END_X} ${GROUND_Y}H${RAMP_TOP_X}Z`;
export const RAMP_EDGE_PATH = `M${RAMP_TOP_X - 36} ${FLOOR_Y}H${RAMP_TOP_X}L${LED_END_X} ${GROUND_Y}`;

/** Prolongamento de 30 cm além das extremidades da rampa (NBR 9050). */
const RAIL_EXTENSION = 15;
const railPath = (height: number) =>
  `M${RAMP_TOP_X - RAIL_EXTENSION} ${FLOOR_Y - height}H${RAMP_TOP_X}L${LED_END_X} ${GROUND_Y - height}H${r1(LED_END_X + RAIL_EXTENSION)}`;

/** Corrimão superior (0,92 m) e inferior (0,70 m). */
export const RAIL_TOP_PATH = railPath(46);
export const RAIL_LOW_PATH = railPath(35);
export const RAIL_POSTS_PATH = [652, 748, 844, 940, 1030]
  .map((x) => `M${x} ${r1(rampY(x))}V${r1(rampY(x) - 46)}`)
  .join("");
export const RAIL_GLOW_RANGE = { from: RAMP_TOP_X, to: r1(LED_END_X + RAIL_EXTENSION) } as const;

// Letreiro e número ------------------------------------------------------------------------------

/** Letreiro iluminado no alto da parte direita da fachada. */
export const SIGN = { cx: 840, emblemTop: 96, emblemHeight: 180, wordmarkY: 330, taglineY: 354, width: 410 } as const;
const EMBLEM_SCALE = SIGN.emblemHeight / EMBLEM_HEIGHT;
export const EMBLEM_TRANSFORM = `translate(${r1(SIGN.cx - (EMBLEM_WIDTH * EMBLEM_SCALE) / 2)} ${SIGN.emblemTop}) scale(${EMBLEM_SCALE.toFixed(4)})`;

/** "253" em destaque, no concreto logo acima do pé da rampa (maior que o real, de propósito). */
export const BUILDING_NUMBER = { right: 1110, baseline: 652, size: 104, width: 187 } as const;

// Chão -------------------------------------------------------------------------------------------

export const CURB_Y = 850;
export const LAWN_Y = 855;
/** Faixa de piso vermelho entre duas juntas. */
export const RED_STRIPE = { y: 800, height: 10 } as const;
/** Juntas do piso, mais espaçadas perto de quem olha. */
export const PAVING_JOINTS_PATH = [776, 783, 791, 800, 810, 821, 833, 846]
  .map((y) => `M0 ${y}H${FACADE_WIDTH}`)
  .join("");
