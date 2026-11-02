/**
 * Constantes determinísticas do RookBullCenterpiece (sem Math.random, sem trigonometria em render).
 * Coordenadas de SVG vivem no espaço do emblema: viewBox "0 0 160 240".
 */
import { BULL_BOUNDS } from "@/components/brand/geometry";
import type { HERO_TELEMETRY } from "@/content/nexfort";

/** Atraso e duração (s) de uma etapa da coreografia. */
export type Step = { readonly delay: number; readonly duration: number };

/** Movimento reduzido: tudo aparece já composto. */
export const INSTANT: Step = { delay: 0, duration: 0 };

/**
 * Linha do tempo da entrada (s, a partir do momento em que o palco entra na tela).
 * Torre: ameias → colunas → base → detalhes → preenchimento. O touro acende 0.4s depois da torre consolidada.
 */
// Compactada para o hero: torre consolidada em 1.8s, ignição em 2.2s, cards em ~3s.
export const TIMELINE = {
  halo: { delay: 0, duration: 1.0 },
  chart: { delay: 0.25, duration: 1.2 },
  battlement: { delay: 0.05, duration: 0.7 },
  columns: { delay: 0.35, duration: 0.75 },
  collar: { delay: 0.35, duration: 0.4 },
  base: { delay: 0.7, duration: 0.65 },
  floor: { delay: 0.75, duration: 0.8 },
  details: { delay: 0.95, duration: 0.5 },
  groove: { delay: 1.15, duration: 0.5 },
  fill: { delay: 1.2, duration: 0.6 },
  ignite: { delay: 2.2, duration: 0.8 },
  burst: { delay: 2.3, duration: 1.1 },
  glow: { delay: 2.25, duration: 0.9 },
} as const satisfies Record<string, Step>;

/** Intervalo entre as linhas de detalhe (s). */
export const DETAIL_STAGGER = 0.06;

/** Física do ponteiro (sobrescreve a mola padrão de propósito, conforme o briefing). */
export const POINTER_SPRING = { type: "spring", stiffness: 200, damping: 25, mass: 1 } as const;

/** Paralaxe em camadas: a torre pesa (6px), o touro reage com energia (14px) e inclina alguns graus. */
export const PARALLAX = { tower: 6, bull: 14, tiltX: 4, tiltY: 6 } as const;

/**
 * Normalização do ponteiro: o raio de alcance é 1.2× a metade do palco (o máximo só chega longe do centro)
 * e o eixo vertical pesa 0.7, para a inclinação vertical ficar mais contida.
 */
export const POINTER_REACH = 1.2;
export const POINTER_VERTICAL = 0.7;

/** Segundos por ciclo completo do gráfico. */
export const CHART_CYCLE_SECONDS = 18;

/** Largura (unidades do SVG) de um ciclo do gráfico; a faixa desenha dois ciclos lado a lado. */
export const CHART_PERIOD = 288;
export const CHART_HEIGHT = 120;

/**
 * Candles de um ciclo: [x, abertura, fechamento, máxima, mínima]. O eixo y cresce para baixo
 * (fechamento menor que a abertura = candle de alta). Gerado offline e congelado aqui.
 */
export const CHART_CANDLES: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [4, 72.6, 72.3, 69.3, 74.6], [12, 72.1, 69, 63.6, 74.8], [20, 67.8, 72.3, 66, 74.6], [28, 71, 68.4, 65.8, 75.8],
  [36, 68.3, 63.2, 60.4, 71.2], [44, 62.7, 65.4, 60.9, 69.6], [52, 66.4, 68.5, 64.3, 70.8], [60, 67.2, 70.6, 64.9, 75.6],
  [68, 71.4, 67, 61.7, 73.2], [76, 68.3, 59.2, 54.9, 73.5], [84, 60.1, 53.9, 49.2, 65.3], [92, 52.9, 50.2, 46.4, 55.4],
  [100, 51.3, 47.8, 43.7, 54.3], [108, 46.5, 44.4, 41.8, 51.4], [116, 45.5, 38.7, 34.4, 48.2], [124, 37.7, 35.6, 31.9, 42.3],
  [132, 34.8, 42.5, 33, 45.7], [140, 42.1, 48.1, 36.8, 50.4], [148, 48.5, 55.8, 44.1, 57.5], [156, 56.7, 53.8, 50.9, 58.4],
  [164, 55.2, 52.8, 48.8, 57.2], [172, 52.2, 55.1, 50.2, 58.2], [180, 56.2, 61.8, 53.5, 66.9], [188, 61.7, 61.2, 56.4, 64],
  [196, 62.2, 57.3, 54.4, 66.4], [204, 57.6, 53.5, 48.8, 60.7], [212, 53.8, 52.9, 48.7, 57.3], [220, 53.3, 64.3, 50.5, 68.4],
  [228, 65.3, 72.3, 61.3, 75], [236, 71.4, 76.8, 67.5, 81.7], [244, 78.2, 76.7, 74.1, 81.9], [252, 77.6, 78.2, 75.9, 80.7],
  [260, 78.4, 87.1, 76.5, 90.3], [268, 87.4, 88.5, 84, 91.2], [276, 89.9, 84, 82.4, 92.4], [284, 84.5, 73, 67.7, 87.5],
];

/** Linha de fechamentos cobrindo dois ciclos (começa um passo antes e termina um depois: o laço não tem emenda). */
export const CHART_LINE =
  "M-4 73L4 72.3L12 69L20 72.3L28 68.4L36 63.2L44 65.4L52 68.5L60 70.6L68 67L76 59.2L84 53.9L92 50.2L100 47.8L108 44.4L116 38.7L124 35.6L132 42.5L140 48.1L148 55.8L156 53.8L164 52.8L172 55.1L180 61.8L188 61.2L196 57.3L204 53.5L212 52.9L220 64.3L228 72.3L236 76.8L244 76.7L252 78.2L260 87.1L268 88.5L276 84L284 73L292 72.3L300 69L308 72.3L316 68.4L324 63.2L332 65.4L340 68.5L348 70.6L356 67L364 59.2L372 53.9L380 50.2L388 47.8L396 44.4L404 38.7L412 35.6L420 42.5L428 48.1L436 55.8L444 53.8L452 52.8L460 55.1L468 61.8L476 61.2L484 57.3L492 53.5L500 52.9L508 64.3L516 72.3L524 76.8L532 76.7L540 78.2L548 87.1L556 88.5L564 84L572 73L580 72.3";

/** Micro candlestick que sobe dentro da torre: posição de nascimento, subida, ciclo (s) e fase inicial (0–1). */
export type Particle = {
  readonly x: number;
  readonly y: number;
  readonly rise: number;
  readonly duration: number;
  readonly phase: number;
  readonly body: number;
  readonly tone: "green" | "gold";
};

/** 12 partículas com posições fixas: nascem atrás do touro e sobem pela coluna. */
export const PARTICLES: readonly Particle[] = [
  { x: 52, y: 168, rise: 92, duration: 5.2, phase: 0, body: 5, tone: "gold" },
  { x: 63, y: 150, rise: 84, duration: 4.4, phase: 0.55, body: 3.6, tone: "green" },
  { x: 74, y: 176, rise: 104, duration: 6, phase: 0.25, body: 4.4, tone: "green" },
  { x: 85, y: 158, rise: 88, duration: 4.8, phase: 0.78, body: 5.6, tone: "gold" },
  { x: 96, y: 170, rise: 100, duration: 5.6, phase: 0.4, body: 3.8, tone: "green" },
  { x: 107, y: 152, rise: 80, duration: 4.2, phase: 0.12, body: 4.8, tone: "gold" },
  { x: 58, y: 132, rise: 70, duration: 4.6, phase: 0.66, body: 3.2, tone: "green" },
  { x: 90, y: 128, rise: 74, duration: 5, phase: 0.9, body: 4.2, tone: "green" },
  { x: 112, y: 140, rise: 78, duration: 5.4, phase: 0.33, body: 3.4, tone: "gold" },
  { x: 69, y: 186, rise: 108, duration: 6.4, phase: 0.84, body: 4.6, tone: "gold" },
  { x: 101, y: 184, rise: 106, duration: 6.2, phase: 0.06, body: 5.2, tone: "green" },
  { x: 80, y: 120, rise: 64, duration: 4, phase: 0.48, body: 3, tone: "gold" },
];

/** Opacidade de pico por tom (verde discreto, dourado um pouco mais presente). */
export const PARTICLE_ALPHA = { green: 0.5, gold: 0.7 } as const;

/** Varredura de calor: retângulo de preenchimento + frente quente, transladados da esquerda para a direita. */
export const SWEEP = (() => {
  const pad = 2;
  const front = 26;
  return {
    fillX: BULL_BOUNDS.x - pad,
    fillWidth: BULL_BOUNDS.width + pad * 2,
    frontX: BULL_BOUNDS.x + BULL_BOUNDS.width + pad,
    frontWidth: front,
    y: BULL_BOUNDS.y - pad,
    height: BULL_BOUNDS.height + pad * 2,
    /** Translação inicial: frente e preenchimento inteiros à esquerda do touro. */
    from: -(BULL_BOUNDS.width + pad * 3 + front),
  };
})();

/** Centro do touro em % da caixa do emblema (âncora do brilho dourado). */
export const BULL_CENTER = {
  left: `${(((BULL_BOUNDS.x + BULL_BOUNDS.width / 2) / 160) * 100).toFixed(2)}%`,
  top: `${(((BULL_BOUNDS.y + BULL_BOUNDS.height / 2) / 240) * 100).toFixed(2)}%`,
} as const;

type TelemetryCode = (typeof HERO_TELEMETRY)[number]["code"];

/**
 * Posição dos cards flutuantes (container ≥ 29rem): ladeiam a coluna da torre, entre o pescoço (y 52) e o plinto (y 196).
 * 0.3375 = 54/160: o topo dos cards de cima fica em y 54 e a base dos de baixo em y 186 (240 − 54).
 * A largura da torre (--tower-w) é calculada para sobrar 8.5rem (card) + 0.75rem (folga) = 9.25rem de cada lado
 * da coluna nessa faixa: a meia-largura da coluna em y 186 ≈ 54.2/160 da torre, daí o fator 2.95 ≈ 160/54.2.
 * Em 29rem a faixa tem ~205px de altura, o bastante para dois cards (~90px cada) sem se tocarem.
 */
export const TELEMETRY_SLOT: Record<TelemetryCode, string> = {
  PAT: "@min-[29rem]:left-0 @min-[29rem]:top-[calc(var(--stage-pt)+var(--tower-w)*0.3375)]",
  B2B: "@min-[29rem]:right-0 @min-[29rem]:top-[calc(var(--stage-pt)+var(--tower-w)*0.3375)]",
  CDI: "@min-[29rem]:left-0 @min-[29rem]:bottom-[calc(var(--stage-pb)+var(--tower-w)*0.3375)]",
  IBOV: "@min-[29rem]:right-0 @min-[29rem]:bottom-[calc(var(--stage-pb)+var(--tower-w)*0.3375)]",
};

/** Flutuação ociosa dos cards: amplitude (px) e períodos (s) diferentes para não sincronizarem. */
export const FLOAT_AMPLITUDE = 3;
export const FLOAT_PERIODS = [5.6, 6.4, 5.1, 6.9] as const;
