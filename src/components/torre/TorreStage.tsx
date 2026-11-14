"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import {
  CAMERA,
  ensureRig,
  measureRests,
  onSceneReady,
  poseAt,
  requestSnap,
  setInstant,
  worldPerPx,
  writeTarget,
  type Rest,
  type TorreRig,
} from "./choreography";

// O 3D (three.js + R3F) fica fora do pacote principal: carrega depois que a página já está na tela.
const TorreScene = dynamic(() => import("./TorreScene"), { ssr: false });

let webglSupport: boolean | undefined;
function hasWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}
const noSubscribe = () => () => {};

/**
 * Palco da Torre: um canvas do tamanho da tela, entre os fundos das seções e o texto (camadas em globals.css).
 * A rolagem decide onde a Torre está (âncoras [data-torre-anchor] nas seções) e quanto ela já girou. O canvas
 * fica fixo na tela enquanto a Torre viaja entre âncoras e, quando ela está presa a uma âncora, é posicionado
 * sobre essa âncora e rola com a página (choreography.ts). Nada se mexe sozinho, fora a Chegada.
 */
export function TorreStage({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const rigRef = useRef<TorreRig | null>(null);
  // no servidor e na hidratação: false; no cliente: a capacidade real do aparelho
  const webgl = useSyncExternalStore(noSubscribe, hasWebGL, () => false);

  const { contextSafe } = useGSAP(
    () => {
      const rig = ensureRig(rigRef);
      if (!hasWebGL()) document.documentElement.dataset.webgl = "off"; // emblema 2D nas âncoras

      const anchors = gsap.utils.toArray<HTMLElement>("[data-torre-anchor]", container.current);
      if (!anchors.length) return;
      const labels = gsap.utils.toArray<HTMLElement>("[data-torre-labels]", container.current);
      const webglOn = hasWebGL();
      let labelOpacity = "";
      const ease = gsap.parseEase("power3.inOut");
      const mm = gsap.matchMedia();

      mm.add(
        // "always" garante que a função rode mesmo quando nenhuma das outras condições casa (desktop, movimento normal)
        { always: "all", reduce: "(prefers-reduced-motion: reduce)", stacked: "(max-width: 63.99rem)" }, // 64rem = o lg do Tailwind, em rem como ele
        (ctx) => {
          const { reduce = false, stacked = false } = ctx.conditions ?? {};
          setInstant(rig, reduce); // menos movimento: a pose troca de uma vez
          let rests: Rest[] = [];
          let viewport = { w: document.documentElement.clientWidth, h: window.innerHeight };
          let origin = 0; // Y do documento em que o contêiner começa: o canvas preso é posicionado dentro dele
          let dock: number | null | undefined; // onde o canvas está agora (undefined: ainda não aplicado)

          const apply = (scroll: number) => {
            if (!rests.length) return;
            // celular (empilhado) e menos movimento: sempre presa à âncora mais próxima; desktop: viaja entre as visíveis
            const pose = poseAt(scroll, rests, { docked: stacked || reduce, reduce, ease, shrink: 0.4, vh: viewport.h });

            if (pose.dock !== dock) {
              // mudou de âncora, ou passou de presa a viajando: o canvas muda de lugar e a pose vai direto ao alvo
              dock = pose.dock;
              const el = stage.current;
              if (el) {
                el.toggleAttribute("data-docked", dock !== null);
                el.style.transform = dock === null ? "" : `translate3d(0, ${Math.round(dock - origin)}px, 0)`;
              }
              requestSnap(rig);
            }

            const { w: vw, h: vh } = viewport;
            const k = worldPerPx(vh);
            const y = (vh / 2 - pose.cy) * k;
            writeTarget(rig, {
              x: (pose.cx - vw / 2) * k,
              y,
              h: pose.h * k,
              rot: pose.rot,
              // inclina para a câmera: a vista tem a mesma elevação em qualquer altura da tela
              tilt: pose.elev + Math.atan(y / CAMERA.z),
              shadow: pose.shadow,
              explode: pose.explode,
            });
            if (stage.current) stage.current.style.opacity = String(pose.opacity);
            // os nomes das etapas só aparecem com a Torre 3D quase toda aberta (sem WebGL o emblema 2D não se desmonta)
            const named = webglOn ? String(Math.min(1, Math.max(0, (pose.explode - 0.6) / 0.4))) : "0";
            if (named !== labelOpacity) {
              labelOpacity = named;
              labels.forEach((label) => (label.style.opacity = named));
            }
            // presa e fora da tela (o canvas inteiro): não desenha; quando voltar, a pose vai direto ao alvo
            if (pose.dock !== null && Math.abs(pose.dock - scroll) >= vh) requestSnap(rig);
            else rig.invalidate?.();
          };

          const measure = () => {
            viewport = { w: document.documentElement.clientWidth, h: window.innerHeight };
            origin = (container.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
            // o canvas tem sempre a altura da tela medida aqui: as contas da pose e o desenho usam o mesmo número
            stage.current?.style.setProperty("--stage-h", `${viewport.h}px`);
            rests = measureRests(anchors, viewport.h, ScrollTrigger.maxScroll(window));
            dock = undefined; // remedido: o lugar do canvas é reaplicado
            // o descanso (rolagem) de cada âncora fica no DOM como estado do app: os roteiros de QA leem daqui, não refazem a regra
            rests.forEach((rest, i) => (anchors[i].dataset.torreRest = String(Math.round(rest.s))));
          };

          const trigger = ScrollTrigger.create({
            start: 0,
            end: "max",
            onRefresh: (self) => {
              measure();
              apply(self.scroll());
            },
            onUpdate: (self) => apply(self.scroll()),
          });
          measure();
          apply(trigger.scroll());
          requestSnap(rig);

          // ao trocar de layout (ou de preferência de movimento) o canvas volta a ficar fixo; a nova medição decide de novo
          return () => {
            stage.current?.removeAttribute("data-docked");
            if (stage.current) stage.current.style.transform = "";
          };
        },
      );
    },
    { scope: container },
  );

  // Chegada: a luz de estúdio acende enquanto a Torre termina de girar até a pose 3/4. Uma vez só.
  useEffect(() => {
    const rig = ensureRig(rigRef);
    return onSceneReady(
      rig,
      contextSafe(() => {
        inner.current?.setAttribute("data-ready", "");
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        gsap.fromTo(
          rig.intro,
          { light: 0, spin: reduce ? 0 : -0.62 },
          {
            light: 1,
            spin: 0,
            duration: reduce ? 0.6 : 1.8,
            ease: "power4.out",
            onUpdate: () => rig.invalidate?.(),
          },
        );
      }),
    );
  }, [contextSafe]);

  return (
    // overflow-clip: preso a uma âncora, o canvas pode passar do começo ou do fim da página; cortado aqui, ele não
    // aumenta a altura rolável (clip não cria área de rolagem nem afeta o cabeçalho fixo)
    <div ref={container} className="relative overflow-clip">
      <div ref={stage} className="torre-stage" aria-hidden="true">
        <div ref={inner} className="torre-stage__inner">
          {webgl ? <TorreScene rigRef={rigRef} /> : null}
        </div>
      </div>
      {/* sem z-index aqui: os fundos e nichos das seções ficam abaixo do canvas, e o texto (classe `layer`) acima */}
      <div>{children}</div>
    </div>
  );
}
