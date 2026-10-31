import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Ensina o tailwind-merge sobre os utilitários customizados de globals.css,
// senão `cn("bg-bull-gradient", "bg-ink")` descartaria o gradiente (lido como cor de fundo).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "bg-image": [{ bg: ["bull-gradient", "cta-gradient"] }],
      ease: [{ ease: ["out-expo"] }],
    },
  },
});

/** Combina classes condicionais (clsx) e resolve conflitos do Tailwind (tailwind-merge). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
