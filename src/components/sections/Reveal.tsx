"use client";

import { useRef, type ReactNode } from "react";
import { ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * Revela um bloco de texto uma vez, quando ele entra na tela.
 *
 * O GSAP só decide QUANDO (ScrollTrigger, uma vez) e divide o título em linhas (SplitText, sem máscara: com
 * máscara, a linha que entra pela esquerda mostraria o fim da frase primeiro). O movimento é transição CSS
 * de transform/opacity (globals.css): roda no compositor, sem disputar a thread principal com o render da
 * Torre. Ordem: elementos [data-reveal-item] e linhas do título [data-reveal-title], na ordem do documento,
 * com intervalo de 80 ms.
 *
 * Os títulos só são divididos quando a coluna está a uma tela de entrar: dividir todos na hidratação obriga o
 * SplitText a ler o layout por palavra e pesa no carregamento. Até lá o título fica escondido (CSS).
 *
 * Direção: `from` é o lado da coluna na tela. No desktop (≥ 64rem) o texto entra desse lado, em direção
 * ao centro, no mesmo sentido em que a Torre chega: um movimento de câmera, não dois competindo. Abaixo
 * disso a cena só anda na vertical, e o texto sobe (o CSS decide pela largura).
 */
export function Reveal({ children, className, from }: { children: ReactNode; className?: string; from: "left" | "right" }) {
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

      // os SplitText nascem depois do efeito (na rolagem), então a limpeza deles é explícita, no retorno
      const splits: SplitText[] = [];
      let split = false;
      const splitTitles = () => {
        if (split) return;
        split = true;
        el.querySelectorAll<HTMLElement>("[data-reveal-title]").forEach((title) => {
          splits.push(
            SplitText.create(title, {
              type: "lines",
              linesClass: "reveal-line",
              autoSplit: true,
              onSplit: () => {
                order();
                el.setAttribute("data-split", "");
              },
            }),
          );
        });
      };
      order();

      ScrollTrigger.create({ trigger: el, start: "top 150%", once: true, onEnter: splitTitles });
      ScrollTrigger.create({
        trigger: el,
        start: "top 78%",
        once: true,
        onEnter: () => {
          splitTitles(); // salto de rolagem: o título já tem de estar dividido quando a coluna aparece
          el.setAttribute("data-revealed", "");
        },
      });

      // o texto só nasce escondido com JS ativo; este sinal desarma a reserva de 4 s do layout
      document.documentElement.setAttribute("data-reveal-ready", "");

      return () => splits.forEach((s) => s.revert());
    },
    { scope: root },
  );

  return (
    <div ref={root} data-reveal="" data-reveal-from={from} className={cn(className)}>
      {children}
    </div>
  );
}
