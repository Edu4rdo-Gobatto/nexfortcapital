"use client";

import { useRef, type ReactNode } from "react";
import { ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * Revela um bloco de texto uma vez, quando ele entra na tela.
 *
 * O GSAP só decide QUANDO (ScrollTrigger, uma vez) e divide o título em linhas (SplitText com máscara).
 * O movimento é transição CSS de transform/opacity (globals.css): roda no compositor, sem disputar a
 * thread principal com o render da Torre. Ordem: elementos [data-reveal-item] e linhas do título
 * [data-reveal-title], na ordem do documento, com intervalo de 80 ms.
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const order = () => {
        el.querySelectorAll<HTMLElement>("[data-reveal-item], .reveal-line").forEach((node, i) => {
          node.style.setProperty("--i", String(i));
        });
      };

      el.querySelectorAll<HTMLElement>("[data-reveal-title]").forEach((title) => {
        SplitText.create(title, {
          type: "lines",
          mask: "lines",
          linesClass: "reveal-line",
          autoSplit: true,
          onSplit: () => {
            order();
            el.setAttribute("data-split", "");
          },
        });
      });
      order();

      ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
        once: true,
        onEnter: () => el.setAttribute("data-revealed", ""),
      });

      // o texto só nasce escondido com JS ativo; este sinal desarma a reserva de 4 s do layout
      document.documentElement.setAttribute("data-reveal-ready", "");
    },
    { scope: root },
  );

  return (
    <div ref={root} data-reveal="" className={cn(className)}>
      {children}
    </div>
  );
}
