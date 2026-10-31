/**
 * Geometria do gráfico do simulador: escalas, marcas dos eixos e curvas.
 * Puro (sem React). Coordenadas no viewBox fixo VIEW_W × VIEW_H; o SVG escala com a largura
 * e os rótulos HTML usam as mesmas coordenadas convertidas em porcentagem.
 */

export const VIEW_W = 640;
export const VIEW_H = 440;

/** Área de plotagem. À direita sobra espaço para o marcador final; acima, para o rótulo final. */
export const PLOT = { left: 0, right: 624, top: 16, bottom: 424 } as const;

export type Point = readonly [x: number, y: number];

/** Folga acima do maior valor: o rótulo do fim da curva dourada sempre cabe acima dela. */
const HEADROOM = 1.16;
/** Domínio mínimo, para o caso de tudo zerado (sem aporte inicial nem mensal). */
const MIN_DOMAIN = 1_000;
/** Passos "redondos": razão máxima de 4/3 entre vizinhos garante 3 ou 4 marcas no eixo. */
const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] as const;
/** Distância mínima (fração do eixo) entre o último rótulo de ano e o anterior. */
const LAST_YEAR_GAP = 0.2;

export function domainMax(peak: number) {
  return Math.max(peak * HEADROOM, MIN_DOMAIN);
}

/** 3 ou 4 marcas redondas (sem o zero, que é a linha de base) até `max`. */
export function valueTicks(max: number) {
  const target = max / 4;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const factor = NICE_STEPS.find((step) => step * magnitude >= target) ?? 10;
  const step = Math.round(factor * magnitude);
  const ticks: number[] = [];
  for (let i = 1; step * i <= max; i++) ticks.push(step * i);
  return ticks;
}

/** Anos rotulados no eixo X: sempre "hoje" e o último ano, sem colisões no celular. */
export function yearTicks(years: number) {
  const step = years <= 6 ? 1 : years <= 12 ? 2 : 5;
  const ticks = [0];
  for (let year = step; year < years; year += step) {
    if ((years - year) / years >= LAST_YEAR_GAP) ticks.push(year);
  }
  ticks.push(years);
  return ticks;
}

export function scaleX(index: number, count: number) {
  return PLOT.left + (count > 0 ? index / count : 0) * (PLOT.right - PLOT.left);
}

export function scaleY(value: number, max: number) {
  return PLOT.bottom - (Math.max(0, value) / max) * (PLOT.bottom - PLOT.top);
}

/** Converte coordenadas do viewBox em porcentagens para os rótulos HTML sobrepostos. */
export const percentX = (x: number) => `${(x / VIEW_W) * 100}%`;
export const percentY = (y: number) => `${(y / VIEW_H) * 100}%`;

const round = (n: number) => Math.round(n * 100) / 100;
const coords = ([x, y]: Point) => `${round(x)},${round(y)}`;

/**
 * Tangentes de uma interpolação cúbica monotônica (Steffen, 1990; a mesma ideia do
 * curveMonotoneX do d3): a curva suaviza os pontos anuais sem ultrapassá-los.
 */
function monotoneTangents(points: readonly Point[]) {
  const n = points.length;
  const tangents = new Array<number>(n).fill(0);
  if (n < 2) return tangents;

  const secants: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    secants.push((points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0]) || 0);
  }
  if (n === 2) return [secants[0], secants[0]];

  for (let i = 1; i < n - 1; i++) {
    const h0 = points[i][0] - points[i - 1][0];
    const h1 = points[i + 1][0] - points[i][0];
    const s0 = secants[i - 1];
    const s1 = secants[i];
    const p = (s0 * h1 + s1 * h0) / (h0 + h1);
    tangents[i] = (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
  }
  // Extremidades: tangente de um lado só.
  tangents[0] = (3 * secants[0] - tangents[1]) / 2;
  tangents[n - 1] = (3 * secants[n - 2] - tangents[n - 2]) / 2;
  return tangents;
}

/** Segmento cúbico de Hermite entre os pontos i e i + 1 (ou de volta, se `reverse`). */
function bezier(points: readonly Point[], tangents: readonly number[], i: number, reverse: boolean) {
  const [x0, y0] = points[i];
  const [x1, y1] = points[i + 1];
  const dx = (x1 - x0) / 3;
  const c0: Point = [x0 + dx, y0 + dx * tangents[i]];
  const c1: Point = [x1 - dx, y1 - dx * tangents[i + 1]];
  return reverse
    ? `C${coords(c1)} ${coords(c0)} ${coords(points[i])}`
    : `C${coords(c0)} ${coords(c1)} ${coords(points[i + 1])}`;
}

export function linePath(points: readonly Point[]) {
  if (points.length === 0) return "";
  const tangents = monotoneTangents(points);
  let d = `M${coords(points[0])}`;
  for (let i = 0; i < points.length - 1; i++) d += bezier(points, tangents, i, false);
  return d;
}

/** Faixa fechada entre duas curvas: a de cima na ida, a de baixo na volta. */
export function bandPath(upper: readonly Point[], lower: readonly Point[]) {
  if (upper.length === 0 || lower.length === 0) return "";
  const upperTangents = monotoneTangents(upper);
  const lowerTangents = monotoneTangents(lower);
  let d = `M${coords(upper[0])}`;
  for (let i = 0; i < upper.length - 1; i++) d += bezier(upper, upperTangents, i, false);
  d += `L${coords(lower[lower.length - 1])}`;
  for (let i = lower.length - 2; i >= 0; i--) d += bezier(lower, lowerTangents, i, true);
  return `${d}Z`;
}

export type ChartModel = {
  max: number;
  ticks: { value: number; y: number }[];
  years: { value: number; x: number }[];
  savings: Point[];
  strategy: Point[];
  savingsPath: string;
  strategyPath: string;
  bandPath: string;
};

/** Tudo o que o gráfico desenha, derivado das duas séries anuais. */
export function buildChartModel(savings: readonly number[], strategy: readonly number[]): ChartModel {
  const count = Math.max(1, strategy.length - 1);
  const max = domainMax(Math.max(0, ...strategy, ...savings));
  const toPoints = (series: readonly number[]) =>
    series.map((value, index): Point => [scaleX(index, count), scaleY(value, max)]);
  const savingsPoints = toPoints(savings);
  const strategyPoints = toPoints(strategy);

  return {
    max,
    ticks: valueTicks(max).map((value) => ({ value, y: scaleY(value, max) })),
    years: yearTicks(count).map((value) => ({ value, x: scaleX(value, count) })),
    savings: savingsPoints,
    strategy: strategyPoints,
    savingsPath: linePath(savingsPoints),
    strategyPath: linePath(strategyPoints),
    bandPath: bandPath(strategyPoints, savingsPoints),
  };
}
