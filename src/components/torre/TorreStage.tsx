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
 * Palco da Torre: um canvas fixo atrás de todo o conteúdo. A rolagem decide onde a Torre está (âncoras
 * [data-torre-anchor] nas seções) e quanto ela já girou. Nada se mexe sozinho, fora a Chegada.
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
      const ease = gsap.parseEase("power3.inOut");
      const mm = gsap.matchMedia();

      mm.add(
        // "always" garante que a função rode mesmo quando nenhuma das outras condições casa (desktop, movimento normal)
        { always: "all", reduce: "(prefers-reduced-motion: reduce)", stacked: "(max-width: 1023px)" },
        (ctx) => {
          const { reduce = false, stacked = false } = ctx.conditions ?? {};
          let rests: Rest[] = [];

          const apply = (scroll: number) => {
            if (!rests.length) return;
            // desktop: recua e cruza no vão entre os textos; celular (empilhado): esmaece, o texto passa por cima
            const pose = poseAt(scroll, rests, { reduce, ease, dip: stacked ? 0.88 : 0, shrink: stacked ? 0.15 : 0.4 });
            const vw = window.innerWidth;
            const vh = window.innerHeight;
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
            });
            if (stage.current) stage.current.style.opacity = String(pose.opacity);
            rig.invalidate?.();
          };

          const measure = () => {
            rests = measureRests(anchors, window.innerHeight, ScrollTrigger.maxScroll(window));
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
    <div ref={container} className="relative">
      <div ref={stage} className="torre-stage" aria-hidden="true">
        <div ref={inner} className="torre-stage__inner">
          {webgl ? <TorreScene rigRef={rigRef} /> : null}
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
