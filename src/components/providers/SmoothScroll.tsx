"use client";

import "lenis/dist/lenis.css";
import type Lenis from "lenis";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const REDUCE = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};
const smoothAllowed = () => !window.matchMedia(REDUCE).matches;

/**
 * Rolagem com inércia (Lenis) sincronizada com o GSAP: um relógio só (gsap.ticker) para a rolagem e para
 * o ScrollTrigger, sem trepidação na Torre. Desligada para quem pede menos movimento; no toque fica a
 * rolagem nativa do aparelho (padrão do Lenis).
 *
 * A instância do Lenis nasce dentro do próprio ReactLenis, um render depois deste componente: por isso o
 * tique lê o ref a cada quadro em vez de capturá-lo uma vez (capturar cedo deixava a roda do mouse presa).
 */
export function SmoothScroll() {
  const lenisRef = useRef<LenisRef>(null);
  // no servidor e na hidratação: desligado; no cliente: conforme a preferência do sistema (e suas mudanças)
  const enabled = useSyncExternalStore(subscribeMotion, smoothAllowed, () => false);

  useEffect(() => {
    if (!enabled) return;
    let synced: Lenis | undefined;
    const tick = (time: number) => {
      const lenis = lenisRef.current?.lenis;
      if (!lenis) return;
      if (synced !== lenis) {
        lenis.on("scroll", ScrollTrigger.update);
        synced = lenis;
      }
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      synced?.off("scroll", ScrollTrigger.update);
    };
  }, [enabled]);

  return enabled ? <ReactLenis root options={{ autoRaf: false, lerp: 0.1 }} ref={lenisRef} /> : null;
}
