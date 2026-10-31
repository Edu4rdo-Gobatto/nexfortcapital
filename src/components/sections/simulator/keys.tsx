import { cn } from "@/lib/utils";

// Sem "use client": chaves visuais estáticas. Decorativas (aria-hidden): o texto ao lado dá o nome.
// A identidade das séries nunca depende só da cor: traço contínuo com brilho × tracejado.

/** Hex do token `muted` (atributos SVG não leem var() de forma confiável). */
export const SAVINGS_STROKE = "#94A3B8";
/** Tracejado da curva da poupança (px de tela: o traço do gráfico não escala). */
export const SAVINGS_DASH = "6 6";

type KeyProps = { className?: string };

/** Curva Nexfort: traço contínuo no gradiente do touro, com brilho. */
export function StrategyKey({ className }: KeyProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-0.5 w-5 shrink-0 bg-bull-gradient shadow-[0_0_8px_rgb(245_158_11/0.7)]",
        className,
      )}
    />
  );
}

/** Curva da poupança: tracejado cinza, igual ao do gráfico. */
export function SavingsKey({ className }: KeyProps) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 20 2" className={cn("h-0.5 w-5 shrink-0", className)}>
      <line x1="0" y1="1" x2="20" y2="1" stroke={SAVINGS_STROKE} strokeOpacity={0.85} strokeWidth={2} strokeDasharray="4 3" />
    </svg>
  );
}

/** Faixa entre as curvas (a diferença): véu dourado com a borda superior acesa. */
export function BandKey({ className }: KeyProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block size-3 shrink-0 bg-gold/20 shadow-[inset_0_1.5px_0_rgb(245_158_11/0.9)]", className)}
    />
  );
}
