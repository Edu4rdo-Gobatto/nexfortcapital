"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { NexfortEmblem } from "@/components/brand/NexfortLogo";
import { BRAND, PROLOGUE, SECTION_IDS } from "@/content/nexfort";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Quadros gerados por design/motion/build_prologue.py (o script imprime o total). */
const FRAME_COUNT = 55;

/** Larguras geradas pelo script; abaixo de 768px a menor basta e pesa metade. */
const LARGE = 1920;
const SMALL = 1280;
const SMALL_QUERY = "(max-width: 767px)";
const MOTION_QUERY = "(prefers-reduced-motion: no-preference)";

const frameUrl = (width: number, index: number) => `/motion/prologue/${width}/${String(index).padStart(2, "0")}.webp`;

/**
 * Linha do tempo (10 unidades, todas lineares: a rolagem é a curva).
 *   0 – 6.4    os quadros do vídeo: corrida, choque, faísca e explosão
 *   5.2 – 6.6  a luz cresce do centro e toma a tela inteira (o vídeo termina quase branco)
 *   6.6 – 9    a luz se recolhe para o centro e a Torre nasce dela; depois o nome e a assinatura
 *   9 – 10     pausa para leitura antes de soltar a tela
 */
const FILM_END = 6.4;
const TIMELINE_END = 10;

/**
 * Escala do clarão no auge. Ele é um círculo de 100vmax com o miolo opaco até 45% do raio:
 * 3× cobre até os cantos da tela em qualquer proporção.
 */
const FLASH_SCALE = 3;

/** "Finanças Empresariais | Finanças Pessoais | Investimentos" em itens, para quebrar sem "|" solto. */
const TAGLINE_ITEMS = BRAND.tagline.split("|").map((item) => item.trim());

/** Ordem de carga do grosso ao fino (de 32 em 32, de 16 em 16...): rolagens rápidas já acham um quadro próximo. */
function loadOrder(count: number) {
  const order: number[] = [];
  const queued = new Set<number>();
  for (let step = 32; step >= 1; step /= 2) {
    for (let index = 0; index < count; index += step) {
      if (queued.has(index)) continue;
      queued.add(index);
      order.push(index);
    }
  }
  return order;
}

/**
 * Carrega a sequência e desenha no canvas o quadro pedido. Enquanto ele não chega,
 * desenha o carregado mais próximo (de preferência o anterior, que não "adianta" a cena).
 */
function createFramePlayer(canvas: HTMLCanvasElement, width: number) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D indisponível");

  canvas.width = width;
  canvas.height = Math.round((width * 9) / 16);

  const frames: (HTMLImageElement | undefined)[] = new Array(FRAME_COUNT);
  let wanted = 0;
  let drawn = -1;
  let disposed = false;

  const nearestLoaded = () => {
    for (let distance = 0; distance < FRAME_COUNT; distance++) {
      if (frames[wanted - distance]) return wanted - distance;
      if (frames[wanted + distance]) return wanted + distance;
    }
    return -1;
  };

  const render = () => {
    const index = nearestLoaded();
    if (disposed || index < 0 || index === drawn) return;
    context.drawImage(frames[index]!, 0, 0, canvas.width, canvas.height);
    drawn = index;
  };

  loadOrder(FRAME_COUNT).forEach((index, position) => {
    const image = new Image();
    image.decoding = "async";
    // O quadro 0 é o mesmo arquivo do pôster (já em cache); os demais não disputam banda com a página.
    if (position > 0) image.fetchPriority = "low";
    image.src = frameUrl(width, index);
    image.decode().then(
      () => {
        frames[index] = image;
        render();
      },
      () => {}, // quadro que falhou: o vizinho carregado cobre a lacuna
    );
  });

  return {
    show(index: number) {
      wanted = index;
      render();
    },
    dispose() {
      disposed = true;
    },
  };
}

/**
 * Abertura em rolagem: o touro e o urso disparam, se chocam e, do clarão, nasce a Torre Nexfort.
 * Uma seção alta com um palco sticky; a rolagem dentro dela avança os quadros do vídeo (canvas) e a revelação.
 * Com movimento reduzido ou sem JavaScript, a abertura não existe e a página começa na Hero.
 * Enquanto data-prologue="armed" (posto pelo JS), as entradas em CSS da Hero esperam (globals.css).
 */
export function BrandPrologue() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas) return;

      // A Hero entra assim que a abertura acaba (ou nunca começa) e não volta a esperar depois disso.
      const release = () => {
        root.dataset.prologue = "done";
      };

      const mm = gsap.matchMedia(); // registrado no contexto do useGSAP: revertido automaticamente
      mm.add({ motion: MOTION_QUERY, small: SMALL_QUERY }, (context) => {
        const { motion, small } = context.conditions as { motion: boolean; small: boolean };
        if (!motion) return;

        let player: ReturnType<typeof createFramePlayer>;
        try {
          player = createFramePlayer(canvas, small ? SMALL : LARGE);
        } catch {
          release(); // sem canvas, a abertura fica no pôster e a Hero não pode ficar presa
          return;
        }

        // A Hero só espera se ainda há abertura pela frente. O servidor manda "idle": sem JS (ou com JS atrasado),
        // a Hero anima no primeiro paint como sempre; aqui as entradas dela voltam ao início e ficam pausadas
        // (globals.css) até a abertura acabar. Página aberta já depois dela (âncora, recarga): não espera.
        const stillAhead = window.scrollY < root.offsetTop + root.offsetHeight - window.innerHeight;
        if (root.dataset.prologue === "idle" && stillAhead) {
          root.dataset.prologue = "armed";
          document
            .querySelector<HTMLElement>("[data-awaits-prologue]")
            ?.getAnimations({ subtree: true })
            .forEach((animation) => {
              animation.currentTime = 0;
            });
        }

        const q = gsap.utils.selector(root);
        const part = (name: string) => q(`[data-prologue-part="${name}"]`);
        const playhead = { frame: 0 };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onLeave: release,
            // No refresh o GSAP reposiciona a timeline sem eventos: sincroniza o canvas com o quadro certo.
            onRefresh: () => player.show(playhead.frame),
          },
        });

        tl.to(part("cue"), { opacity: 0, y: -16, duration: 0.6 }, 0);
        tl.to(
          playhead,
          {
            frame: FRAME_COUNT - 1,
            snap: "frame",
            duration: FILM_END,
            onUpdate: () => player.show(playhead.frame),
          },
          0,
        );

        // O clarão: uma esfera de luz cresce do centro da explosão até cobrir a tela inteira (inclusive as faixas
        // fora do vídeo no celular). Crescer, e não acender por opacidade, evita um véu cinza sobre o fundo escuro.
        tl.fromTo(part("flash"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 5.2);
        tl.fromTo(part("flash"), { scale: 0.3 }, { scale: FLASH_SCALE, duration: 1.4 }, 5.2);
        tl.to(part("film"), { opacity: 0, duration: 0.01 }, 6.6);
        // ...e se recolhe para o centro ainda acesa (as bordas escurecem primeiro); só apaga quando já é um núcleo
        // sobre a Torre. Apagar a tela inteira de uma vez deixaria um véu bege no meio do caminho.
        tl.to(part("flash"), { scale: 0.35, duration: 1 }, 6.62);
        tl.to(part("flash"), { opacity: 0, duration: 0.8 }, 7.3);
        tl.fromTo(part("halo"), { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 1.6 }, 6.4);
        tl.fromTo(part("emblem"), { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 1.1 }, 6.9);
        tl.fromTo(part("name"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1 }, 7.6);
        tl.fromTo(part("tagline"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 8);
        // autoAlpha: escondido também sai da ordem de foco.
        tl.to(part("skip"), { autoAlpha: 0, duration: 0.6 }, 8.4);
        tl.set({}, {}, TIMELINE_END); // estende a timeline: a assinatura fica parada antes de a tela soltar

        return () => player.dispose();
      });
    },
    { scope: rootRef },
  );

  return (
    <div ref={rootRef} data-prologue="idle" className="relative h-[380svh] bg-ink motion-reduce:hidden print:hidden">
      <div className="sticky top-0 h-dvh overflow-hidden">
        {/* O vídeo: cobre a tela na horizontal; no retrato mostra o miolo (62%) e as bordas se dissolvem. */}
        <div
          data-prologue-part="film"
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 aspect-video w-[max(100%,calc(100dvh*16/9))] -translate-1/2 portrait:w-[160%] portrait:mask-[linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]"
        >
          <picture>
            <source media={SMALL_QUERY} srcSet={frameUrl(SMALL, 0)} />
            {/* Pôster sem next/image de propósito: é o mesmo arquivo do quadro 0 do canvas, então o cache serve os dois. */}
            <img
              src={frameUrl(LARGE, 0)}
              alt=""
              width={LARGE}
              height={1080}
              fetchPriority="high"
              className="absolute inset-0 size-full"
            />
          </picture>
          <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        </div>

        {/* A assinatura: Torre, nome e linha de atuação, empilhados como na logo original. */}
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center px-5 pt-16 lg:pt-20">
          <div className="flex flex-col items-center text-center">
            {/* Halo e clarão centrados na Torre: a luz da explosão se recolhe exatamente onde ela nasce. */}
            <div className="relative">
              <div
                data-prologue-part="halo"
                className="absolute top-1/2 left-1/2 size-[min(130vmin,64rem)] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(245_158_11/0.3),rgb(59_85_196/0.16)_55%,transparent)] opacity-0"
              />
              <div data-prologue-part="emblem" className="relative aspect-[774/1458] h-[min(48svh,28rem)] opacity-0">
                <NexfortEmblem className="size-full" />
              </div>
              <div
                data-prologue-part="flash"
                className="absolute top-1/2 left-1/2 size-[100vmax] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,#fffdf6,#fff3d6_45%,rgb(246_217_162/0.55)_70%,transparent)] opacity-0"
              />
            </div>
            <p
              data-prologue-part="name"
              className="mt-7 font-display text-[clamp(1.6rem,4.2vw,3.1rem)] leading-none font-semibold tracking-[0.08em] text-led uppercase opacity-0"
            >
              {BRAND.shortName}
            </p>
            {/* Numa linha a partir do sm (como na logo); no celular, empilhada e sem "|" solto no começo da linha. */}
            <p
              data-prologue-part="tagline"
              className="mt-4 flex flex-col items-center gap-1.5 font-display text-[clamp(0.58rem,1.05vw,0.78rem)] leading-relaxed font-medium tracking-[0.22em] text-muted uppercase opacity-0 sm:flex-row sm:gap-0"
            >
              {TAGLINE_ITEMS.map((item, index) => (
                <span key={item} className="flex items-center">
                  {index > 0 ? <span className="mx-3 hidden text-muted/50 sm:inline">|</span> : null}
                  {item}
                </span>
              ))}
            </p>
          </div>
        </div>

        <div
          data-prologue-part="cue"
          aria-hidden="true"
          className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-3"
        >
          <span className="font-mono text-[0.68rem] tracking-[0.32em] text-led/70 uppercase">{PROLOGUE.cue}</span>
          <span className="relative h-10 w-px overflow-hidden bg-led/15">
            <span className="absolute inset-0 animate-scroll-cue bg-led" />
          </span>
        </div>

        <a
          data-prologue-part="skip"
          href={`#${SECTION_IDS.hero}`}
          className="absolute top-20 right-5 bg-ink/70 px-3 py-2 font-mono text-[0.68rem] tracking-[0.2em] text-muted uppercase backdrop-blur-sm transition-colors duration-200 ease-out-expo hover:text-led focus-visible:text-led focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:right-8 lg:top-26"
        >
          {PROLOGUE.skip}
        </a>
      </div>
    </div>
  );
}
