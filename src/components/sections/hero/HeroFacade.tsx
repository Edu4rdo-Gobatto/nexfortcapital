"use client";

import type { CSSProperties } from "react";
import { motion, type Variants } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/animations";

/*
 * A fachada da sede (Av. Das Artes, 253) como cenário da coluna direita do hero:
 * um monólito de concreto cuja aresta superior é cortada no ângulo da fachada, com a fita de LED
 * correndo exatamente sobre esse corte e seguindo, para cima e à esquerda, através do hero inteiro.
 *
 * Tudo parte da "proa", na borda esquerda do invólucro, --lip abaixo do topo (a folga guarda o brilho do LED):
 * - a laje desce dali com inclinação tan(--facade-angle), medida em 100cqw (largura do próprio invólucro);
 * - a linha gira em torno da proa com o mesmo --facade-angle.
 * Por isso corte e luz coincidem em qualquer largura de tela, sem JS de medição.
 */

/** Aresta superior a 32° a partir da proa; chanfro inferior esquerdo paralelo a ela. */
const SLAB_CLIP: CSSProperties = {
  clipPath:
    "polygon(0 var(--lip), 100% calc(var(--lip) + 100cqw * tan(var(--facade-angle))), 100% 100%, 7rem 100%, 0 calc(100% - 7rem * tan(var(--facade-angle))))",
};

/** O trecho que sobe para a esquerda (atrás da navbar) nasce tênue e chega ao brilho total na proa. */
const LINE_FADE: CSSProperties = {
  maskImage: "linear-gradient(90deg, transparent, rgb(0 0 0 / 0.55) calc(var(--back) * 0.7), #000 var(--back))",
};

// Desenho único da fita: scaleX a partir da ponta superior esquerda.
const draw = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.8, ease: EASE_OUT_EXPO, delay: 0.2 } },
} satisfies Variants;

export function HeroFacade() {
  return (
    <motion.div
      aria-hidden="true"
      className={[
        "@container pointer-events-none absolute -z-10 [--lip:2.5rem]",
        // --back: quanto a linha se estende atrás da proa; --fwd: quanto avança à frente dela.
        "[--back:0px] [--fwd:125vw] lg:[--back:100svh] lg:[--fwd:60vw]",
        // Mobile/tablet: laje de ponta a ponta atrás do emblema (proa 3rem abaixo do topo da coluna), recortada
        // no próprio invólucro para a diagonal longa nunca invadir a seção seguinte.
        "top-2 -right-5 -bottom-6 -left-5 overflow-hidden sm:-right-8 sm:-left-8",
        // Desktop: proa no topo da coluna, laje sangrando à direita; a linha sai do invólucro e cruza o hero.
        "lg:-top-10 lg:right-[-50vw] lg:-bottom-10 lg:left-12 lg:overflow-visible",
      ].join(" ")}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="concrete-noise absolute inset-0 bg-concrete" style={SLAB_CLIP}>
        {/* Assenta a base do bloco no fundo da página. */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent from-40% to-ink/85" />
        {/* Aresta vertical do monólito pegando a luz que desce da proa (no mobile essa aresta é a borda da tela). */}
        <div className="absolute inset-y-0 left-0 hidden w-px bg-linear-to-b from-led/25 via-led/6 to-transparent lg:block" />
      </div>

      <div className="absolute top-(--lip) left-0 size-0 rotate-(--facade-angle)">
        <motion.div
          className="absolute -top-10 -left-(--back) h-20 w-[calc(var(--back)+var(--fwd))] origin-left"
          style={LINE_FADE}
          variants={draw}
        >
          <span className="absolute inset-x-0 top-1/2 h-px bg-led shadow-[0_0_2px_rgb(248_250_252/0.9),0_0_12px_rgb(248_250_252/0.45),0_0_32px_rgb(245_158_11/0.14)]" />
        </motion.div>
      </div>
    </motion.div>
  );
}
