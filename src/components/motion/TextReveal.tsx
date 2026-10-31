"use client";

import { Fragment, type CSSProperties } from "react";
import { motion, stagger, type Variants } from "motion/react";
import { SPRING_SMOOTH } from "@/lib/animations";

const WHITESPACE = /\s+/;

// Sem `delay` aqui: um delay no filho substitui o atraso calculado pelo stagger do pai.
const word = {
  hidden: { y: "100%" },
  visible: { y: "0%", transition: SPRING_SMOOTH },
} satisfies Variants;

// Máscara: o padding interno dá espaço às descendentes; a margem negativa preserva a entrelinha.
const MASK = "-mb-[0.12em] inline-block overflow-hidden align-top";
const WORD = "inline-block pb-[0.12em]";

type TextRevealProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  id?: string;
  className?: string;
  /** Atraso antes da primeira palavra (s). */
  delay?: number;
  /** Intervalo entre palavras (s). */
  stagger?: number;
  /**
   * "view" (padrão): mola do Motion ao entrar na tela. "load": keyframes CSS que começam no primeiro
   * paint, sem esperar a hidratação. Use "load" em títulos acima da dobra (LCP).
   */
  trigger?: "view" | "load";
};

/**
 * Revela o texto palavra a palavra: cada palavra sobe de y 100% → 0% dentro de uma máscara overflow-hidden.
 * Leitores de tela recebem a frase inteira (sr-only); as palavras animadas ficam aria-hidden.
 */
export function TextReveal({
  text,
  as: Tag = "p",
  id,
  className,
  delay = 0,
  stagger: each = 0.05,
  trigger = "view",
}: TextRevealProps) {
  const words = text.trim().split(WHITESPACE);

  if (trigger === "load") {
    return (
      <Tag id={id} className={className}>
        <span className="sr-only">{text}</span>
        <span aria-hidden="true">
          {words.map((w, i) => (
            <Fragment key={`${i}-${w}`}>
              <span className={MASK}>
                <span
                  className={`${WORD} motion-safe:animate-rise`}
                  style={{ "--nx-delay": `${(delay + i * each).toFixed(3)}s` } as CSSProperties}
                >
                  {w}
                </span>
              </span>
              {i < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </span>
      </Tag>
    );
  }

  const container = {
    hidden: {},
    visible: { transition: { delayChildren: stagger(each, { startDelay: delay }) } },
  } satisfies Variants;

  return (
    <Tag id={id} className={className}>
      <span className="sr-only">{text}</span>
      <motion.span
        aria-hidden="true"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        {words.map((w, i) => (
          <Fragment key={`${i}-${w}`}>
            <span className={MASK}>
              <motion.span data-reveal="" className={WORD} variants={word}>
                {w}
              </motion.span>
            </span>
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}
