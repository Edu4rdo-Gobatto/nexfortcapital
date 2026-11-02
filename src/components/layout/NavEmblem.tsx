"use client";

import { motion } from "motion/react";
import { EMBLEM_SIZE, EMBLEM_SRC } from "@/components/brand/NexfortLogo";
import { SPRING_SMOOTH } from "@/lib/animations";

/**
 * Mini emblema do cabeçalho: a Torre da logo original, idêntica.
 * Na carga, entra com a mola padrão (opacidade + escala). Decorativo (aria-hidden).
 */
export function NavEmblem({ className }: { className?: string }) {
  return (
    <motion.img
      src={EMBLEM_SRC}
      width={EMBLEM_SIZE.width}
      height={EMBLEM_SIZE.height}
      alt=""
      aria-hidden="true"
      decoding="async"
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={SPRING_SMOOTH}
    />
  );
}
