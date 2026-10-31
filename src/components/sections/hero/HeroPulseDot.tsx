"use client";

import { useRef } from "react";
import { useInView } from "motion/react";

/**
 * LED âmbar de status do selo do hero. O pulso é CSS (transform + opacity) só sob motion-safe,
 * e fica pausado enquanto o selo está fora da tela.
 * WCAG 2.2.2: só 2 ciclos de 2,4s (4,8s). A contagem vai dentro de --animate-ping porque o shorthand `animation`
 * do animate-ping (sob motion-safe, emitido depois) sobrescreveria um animation-iteration-count avulso. Ao terminar,
 * o anel volta, sem animação, para baixo do ponto sólido: o LED repousa aceso.
 */
export function HeroPulseDot() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);

  return (
    <span ref={ref} aria-hidden="true" className="relative mt-[0.35em] flex size-2 shrink-0">
      <span
        className="absolute inset-0 bg-gold/80 [--animate-ping:ping_2.4s_cubic-bezier(0.22,1,0.36,1)_2] motion-safe:animate-ping"
        style={{ animationPlayState: inView ? "running" : "paused" }}
      />
      <span className="relative size-2 bg-gold shadow-[0_0_10px_rgb(245_158_11/0.75)]" />
    </span>
  );
}
