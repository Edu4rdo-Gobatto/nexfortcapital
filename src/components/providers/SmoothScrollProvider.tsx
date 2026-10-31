"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap"; // mantém também os tipos ambientes de "gsap/ScrollTrigger"
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ReactLenis, useLenis, type LenisRef } from "lenis/react";
import type { LenisOptions } from "lenis";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Constante de módulo: o ReactLenis recria a instância quando JSON.stringify(options) muda.
const LENIS_OPTIONS: LenisOptions = {
  autoRaf: false, // quem dirige o raf é o gsap.ticker (a prop autoRaf, depreciada, é true por padrão)
  anchors: true, // <a href="#id"> rola suave e respeita scroll-margin-top das seções
  stopInertiaOnNavigate: true,
  respectReducedMotion: true, // com prefers-reduced-motion: lerp 1 e scrollTo instantâneo
};

/** Lenis (inércia) sincronizado ao gsap.ticker e ao ScrollTrigger. Monte uma única vez, no layout raiz. */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  // Cada evento de scroll do Lenis atualiza o ScrollTrigger (função estável; funciona acima do <ReactLenis root>).
  useLenis(ScrollTrigger.update);

  // O modo root não renderiza DOM, então não há elemento para `scope`; aqui não usamos seletores.
  useGSAP(() => {
    // A instância só existe depois do primeiro commit do ReactLenis: leia a ref a cada tick.
    const update = (time: number) => {
      lenisRef.current?.lenis?.raf(time * 1000); // ticker em segundos → Lenis em ms
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33); // padrões do GSAP
    };
  });

  return (
    <ReactLenis root options={LENIS_OPTIONS} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
