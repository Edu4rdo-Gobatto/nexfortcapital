"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type ParallaxBoxProps = {
  children: ReactNode;
  /** Deslocamento em cada direção, como fração da altura do filho (positivo = mais lento que o scroll). */
  speed?: number;
  className?: string;
};

/** Desloca o eixo Y do filho durante o scroll (ScrollTrigger com scrub). O gatilho é o invólucro, que não se move. */
export function ParallaxBox({ children, speed = 0.15, className }: ParallaxBoxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia(); // registrado no contexto do useGSAP: revertido automaticamente
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          innerRef.current,
          { yPercent: -speed * 100 },
          {
            yPercent: speed * 100,
            ease: "none", // com scrub, o progresso já é o scroll: a curva deve ser linear
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: containerRef, dependencies: [speed], revertOnUpdate: true },
  );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div ref={innerRef} className="will-change-transform">
        {children}
      </div>
    </div>
  );
}
