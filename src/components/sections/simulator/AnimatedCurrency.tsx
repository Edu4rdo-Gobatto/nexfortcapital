"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { SPRING_SMOOTH } from "@/lib/animations";
import { formatBRL } from "@/lib/finance";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

// A mola pode passar alguns décimos do alvo ao descer até zero: nunca exiba "-R$".
const toCurrency = (value: number) => formatBRL(Math.max(0, value));
/** "R$ 1.234" → "1.234" (o símbolo é desenhado à parte, menor). */
const CURRENCY_SYMBOL = /^R\$\s?/;
const toAmount = (value: number) => toCurrency(value).replace(CURRENCY_SYMBOL, "");

type AnimatedCurrencyProps = {
  value: number;
  className?: string;
  /** Figuras grandes: "R$" menor e discreto antes do valor. */
  splitSymbol?: boolean;
};

/**
 * Valor em reais que "conta" até o novo alvo com a mola padrão (SPRING_SMOOTH).
 * A mola nasce no valor recebido, então o HTML do servidor já sai com o número certo.
 * Decorativo para leitores de tela (aria-hidden): quem usa o componente expõe o valor em texto.
 */
export function AnimatedCurrency({ value, className, splitSymbol = false }: AnimatedCurrencyProps) {
  const spring = useSpring(value, SPRING_SMOOTH);
  const text = useTransform(spring, splitSymbol ? toAmount : toCurrency);
  const reduceMotion = usePrefersReducedMotion(); // ao vivo; useSpring ignora o MotionConfig: tratado aqui

  useEffect(() => {
    if (reduceMotion) spring.jump(value);
    else spring.set(value);
  }, [spring, value, reduceMotion]);

  if (!splitSymbol) {
    return (
      <motion.span aria-hidden="true" className={className}>
        {text}
      </motion.span>
    );
  }

  return (
    <span aria-hidden="true" className={className}>
      <span className="mr-[0.3em] text-[0.5em] text-muted">R$</span>
      <motion.span>{text}</motion.span>
    </span>
  );
}
