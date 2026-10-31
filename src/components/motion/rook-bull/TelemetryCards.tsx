"use client";

import type { ReactNode } from "react";
import { motion, stagger, useTransform, type MotionValue, type Variants } from "motion/react";
import { Minus, ShieldCheck, TrendingUp } from "lucide-react";
import { HERO_TELEMETRY, type TelemetrySignal } from "@/content/nexfort";
import { EASE_OUT_EXPO, SPRING_SMOOTH } from "@/lib/animations";
import { cn } from "@/lib/utils";
import {
  FLOAT_AMPLITUDE,
  FLOAT_PERIODS,
  TELEMETRY_FOCUS,
  TELEMETRY_SLOT,
  type VisualMode,
} from "./constants";
import { MODE_SHIFT } from "./presets";

const SIGNAL_ICON = { up: TrendingUp, steady: Minus, shield: ShieldCheck } as const;

const SIGNAL_TONE: Record<TelemetrySignal, string> = {
  up: "text-gold",
  steady: "text-muted",
  shield: "text-[#8EA2FF]",
};

/** Entrada depois da ignição. Sem `delay` aqui: o stagger do pai define a cadência. */
const cardEntrance = {
  hidden: { opacity: 0, y: 14 },
  shown: (reduce: boolean | null) => ({
    opacity: 1,
    y: 0,
    transition: reduce ? { duration: 0 } : { ...SPRING_SMOOTH, opacity: { duration: 0.6, ease: EASE_OUT_EXPO } },
  }),
} satisfies Variants;

/**
 * Flutuação ociosa via transform, dirigida pelo relógio do componente (pausa fora da tela ou pelo botão de pausa e
 * para com movimento reduzido). Só existe no layout flutuante: na grade 2×2 o transform é anulado para as linhas
 * ficarem alinhadas.
 */
function IdleFloat({ clock, period, children }: { clock: MotionValue<number>; period: number; children: ReactNode }) {
  const y = useTransform(clock, (t) => Math.sin((t / period) * Math.PI * 2) * FLOAT_AMPLITUDE);
  return (
    <motion.div className="h-full @max-[29rem]:transform-none!" style={{ y }}>
      {children}
    </motion.div>
  );
}

type TelemetryCardsProps = {
  mode: VisualMode;
  ignited: boolean;
  reduce: boolean | null;
  /** Relógio da flutuação (s). */
  clock: MotionValue<number>;
  className?: string;
};

/**
 * Cards de telemetria qualitativos (sem cotações): grade 2×2 abaixo do emblema em telas estreitas;
 * flutuam ao redor da coluna da torre quando o container tem ≥ 29rem (ver TELEMETRY_SLOT e --tower-w).
 */
export function TelemetryCards({ mode, ignited, reduce, clock, className }: TelemetryCardsProps) {
  const list: Variants = {
    hidden: {},
    shown: { transition: { delayChildren: reduce ? 0 : stagger(0.09) } },
  };

  return (
    <motion.ul
      aria-label="Frentes de atuação"
      className={cn(
        "grid grid-cols-2 gap-2",
        "@min-[29rem]:pointer-events-none @min-[29rem]:relative @min-[29rem]:block",
        className,
      )}
      variants={list}
      initial="hidden"
      animate={ignited ? "shown" : "hidden"}
    >
      {HERO_TELEMETRY.map((item, index) => {
        const Icon = SIGNAL_ICON[item.signal];
        const emphasis = mode === null ? "idle" : TELEMETRY_FOCUS[mode].includes(item.code) ? "on" : "off";

        return (
          <motion.li
            key={item.code}
            className={cn("min-w-0 @min-[29rem]:absolute @min-[29rem]:w-34", TELEMETRY_SLOT[item.code])}
            variants={cardEntrance}
            custom={reduce}
          >
            <IdleFloat clock={clock} period={FLOAT_PERIODS[index] ?? FLOAT_PERIODS[0]}>
              <motion.div
                className="relative isolate h-full px-3 pt-2.5 pb-3 @min-[29rem]:px-2.5 @min-[29rem]:pb-2.5"
                initial={{ opacity: 1, scale: 1 }}
                // 0.75 no mínimo: o detalhe (text-muted, 11px) segue com contraste AA (~4.6:1) mesmo esmaecido.
                animate={{
                  opacity: emphasis === "off" ? 0.75 : 1,
                  scale: emphasis === "on" ? 1.03 : emphasis === "off" ? 0.97 : 1,
                }}
                transition={MODE_SHIFT}
              >
                {/* Concreto translúcido com borda de 1px que acompanha o chanfro. */}
                <span aria-hidden="true" className="clip-chamfer absolute inset-0 -z-10 bg-white/10 [--cut:10px]" />
                <span
                  aria-hidden="true"
                  className="clip-chamfer concrete-noise absolute inset-px -z-10 bg-concrete/85 [--cut:10px] @min-[29rem]:backdrop-blur-[3px]"
                />
                <motion.span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-0 left-0 h-px w-[calc(100%-10px)] origin-left",
                    mode === "bull"
                      ? "bg-bull-gradient shadow-[0_0_8px_rgb(245_158_11/0.7)]"
                      : "bg-royal-glow shadow-[0_0_8px_rgb(59_85_196/0.9)]",
                  )}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: emphasis === "on" ? 1 : 0, opacity: emphasis === "on" ? 1 : 0 }}
                  transition={MODE_SHIFT}
                />
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[0.7rem] font-medium tracking-[0.08em] text-led tabular-nums">
                    {item.code}
                  </span>
                  <Icon className={cn("size-3.5 shrink-0", SIGNAL_TONE[item.signal])} strokeWidth={2} />
                </div>
                <p className="mt-1.5 text-[0.78rem] leading-tight font-semibold text-led">{item.label}</p>
                <p className="mt-1 text-[0.7rem] leading-snug text-muted">{item.detail}</p>
              </motion.div>
            </IdleFloat>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
