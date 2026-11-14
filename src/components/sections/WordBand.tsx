"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Faixa âmbar com os três verbos do slogan em letras grandes, logo depois do hero. As palavras deslizam para o
 * lado conforme a página rola (ScrollTrigger com scrub): nada anda sozinho, e com "menos movimento" ficam
 * paradas. É enfeite: o slogan já está no título da página, então a faixa fica fora da leitura de tela.
 *
 * A faixa fica abaixo do canvas: a Torre marinho cruza por cima dela a caminho do próximo bloco.
 */
export function WordBand({ words }: { words: readonly string[] }) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          track.current,
          { xPercent: 0 },
          { xPercent: -22, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 } },
        );
      });
    },
    { scope: root },
  );

  // a sequência repetida: sempre há palavras entrando pela direita enquanto a faixa desliza
  const sequence = [...words, ...words, ...words];
  return (
    <div ref={root} className="word-band" aria-hidden="true">
      <div ref={track} className="word-band__track">
        {sequence.map((word, i) => (
          <span key={i} className="word-band__word">
            {word}
            <span className="word-band__mark" />
          </span>
        ))}
      </div>
    </div>
  );
}
