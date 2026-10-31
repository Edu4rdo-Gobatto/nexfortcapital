import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BULL_BOUNDS, EMBLEM_HEIGHT, EMBLEM_WIDTH } from "@/components/brand/geometry";

gsap.registerPlugin(ScrollTrigger);

/** Ângulo da fita de LED da fachada (o mesmo --facade-angle de globals.css e os rotate-[32deg] do markup). */
const FACADE_ANGLE = 32;
const RADIANS = (FACADE_ANGLE * Math.PI) / 180;
const SIN = Math.sin(RADIANS);
const COS = Math.cos(RADIANS);

/**
 * Onde o corte de LED repousa no fim: fração da distância entre o centro do palco e o canto inferior esquerdo.
 * Abaixo de 1, sobra uma cunha azul nesse canto: a Torre continua sendo a base de tudo.
 */
const CUT_REST = 0.84;

/** Centro do touro dentro do emblema, em coordenadas do viewBox (para escalar a partir dele). */
const BULL_CENTER = {
  x: BULL_BOUNDS.x + BULL_BOUNDS.width / 2,
  y: BULL_BOUNDS.y + BULL_BOUNDS.height / 2,
};
const BULL_SVG_ORIGIN = `${BULL_CENTER.x} ${BULL_CENTER.y}`;
const BULL_BOX_ORIGIN = `${(BULL_CENTER.x / EMBLEM_WIDTH) * 100}% ${(BULL_CENTER.y / EMBLEM_HEIGHT) * 100}%`;

type StoryScrollTrigger = gsap.TimelineVars["scrollTrigger"];

/** Todo elemento que a timeline anima carrega um destes atributos. */
const STORY_TARGETS = "[data-story], [data-story-item]";

/**
 * Apaga os estilos inline que a timeline deixou. Chame no cleanup do matchMedia: ao reverter o contexto com o
 * pin ativo (ou já passado), o kill do ScrollTrigger re-renderiza o progresso 0 e deixaria o texto do Touro
 * invisível e as fiadas da torre com scaleX 0 no layout empilhado (resize para mobile, movimento reduzido).
 */
export function clearStoryStyles(stage: HTMLElement) {
  gsap.set(stage.querySelectorAll(STORY_TARGETS), { clearProps: "all" });
}

/**
 * Linha do tempo da narrativa Torre → Touro (10 unidades, todas lineares: o scroll é a curva).
 *   0 – 3    A Torre sobe da fundação: fiadas de LED, contorno real, massa e brilho azul.
 *   3 – 6.6  O corte de LED a 32° varre o palco do canto superior direito ao inferior esquerdo; o texto troca.
 *   4 – 8.6  O Touro acende dentro da torre e ganha presença; a paleta passa do azul ao âmbar.
 *   8.6 – 10 Pausa para leitura antes de soltar o pin.
 * Só anima transform e opacity. Seletores sempre restritos ao palco.
 */
export function buildStoryTimeline(stage: HTMLElement, scrollTrigger?: StoryScrollTrigger) {
  const q = gsap.utils.selector(stage);
  // Distância do centro do palco até o canto mais distante, medida na normal do corte.
  const reach = () => (SIN * stage.clientWidth + COS * stage.clientHeight) / 2;

  const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger, paused: !scrollTrigger });

  // Indicador de progresso: acompanha a história inteira.
  tl.fromTo(q('[data-story="rail-fill"]'), { scaleY: 0 }, { scaleY: 1, duration: 10 }, 0);

  // 1. A Torre: construída de baixo para cima.
  // As origens vão no "from": definidas só no "to", o SVG já teria sido desenhado com a origem padrão
  // e o smoothOrigin do GSAP deixaria um deslocamento permanente.
  tl.fromTo(
    q('[data-story="course"]'),
    { scaleX: 0, transformOrigin: "50% 50%" },
    { scaleX: 1, duration: 0.8, stagger: 0.28 },
    0,
  );
  tl.fromTo(q('[data-story="outline-part"]'), { opacity: 0 }, { opacity: 1, duration: 0.9, stagger: 0.5 }, 0.3);
  tl.fromTo(q('[data-story="rook-mass"]'), { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.5 }, 0.8);
  tl.fromTo(q('[data-story="halo-tower"]'), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.6 }, 1.2);

  // 2. A divisão: o semiplano âmbar entra pela diagonal da fachada, com a fita de LED na borda.
  tl.fromTo(q('[data-story="cut"]'), { y: () => -reach() - 64 }, { y: () => reach() * CUT_REST, duration: 3.6 }, 3);
  tl.to(q('[data-story="copy-tower"] [data-story-item]'), { opacity: 0, y: -32, duration: 0.8, stagger: 0.1 }, 3.5);
  tl.fromTo(
    q('[data-story="copy-bull"] [data-story-item]'),
    { opacity: 0, y: 32 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
    5,
  );
  tl.to(q('[data-story="rail-tower"]'), { opacity: 0.45, duration: 0.5 }, 4.6);
  tl.fromTo(q('[data-story="rail-bull"]'), { opacity: 0.45 }, { opacity: 1, duration: 0.5 }, 4.9);
  tl.fromTo(q('[data-story="rail-bull-dot"]'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 4.9);

  // 3. O Touro: a paleta esquenta e o touro acende dentro da torre.
  tl.to(q('[data-story="halo-tower"]'), { opacity: 0, duration: 1.4 }, 4.2);
  tl.fromTo(q('[data-story="halo-bull"]'), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 2.4 }, 4);
  tl.to(q('[data-story="rook-outline"]'), { opacity: 0, duration: 1.2 }, 4.6);
  tl.fromTo(q('[data-story="rook-outline-warm"]'), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 4.6);
  tl.fromTo(q('[data-story="bull"]'), { opacity: 0 }, { opacity: 1, duration: 1.4 }, 4.2);
  tl.fromTo(q('[data-story="bull-body"]'), { scale: 0.84, svgOrigin: BULL_SVG_ORIGIN }, { scale: 1, duration: 2.8 }, 4.2);
  tl.fromTo(q('[data-story="bull-heat"]'), { y: 140 }, { y: 0, duration: 2.4 }, 5.4);
  tl.fromTo(
    q('[data-story="bull-bloom"]'),
    { opacity: 0, scale: 0.86, transformOrigin: BULL_BOX_ORIGIN },
    { opacity: 1, scale: 1.05, duration: 1.8 },
    5,
  );
  tl.to(q('[data-story="bull-bloom"]'), { opacity: 0.6, scale: 1, duration: 1.6 }, 6.8);
  tl.to(q('[data-story="halo-bull"]'), { scale: 1.12, duration: 2.2 }, 6.4);

  return tl;
}
