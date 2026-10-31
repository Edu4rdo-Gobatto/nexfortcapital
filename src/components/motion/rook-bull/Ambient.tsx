"use client";

import { motion } from "motion/react";
import { TIMELINE, type VisualMode } from "./constants";
import { MODE_SHIFT, fadeIn, openLine, stepFor } from "./presets";

const TICKS = [
  "top-0 left-0 border-t border-l",
  "top-0 right-0 border-t border-r",
  "bottom-0 left-0 border-b border-l",
  "bottom-0 right-0 border-b border-r",
] as const;

/** Marcas de registro nos cantos do palco, como numa prancha de arquitetura. */
export function CornerTicks() {
  return (
    <>
      {TICKS.map((position) => (
        <span key={position} aria-hidden="true" className={`absolute size-3 border-white/15 ${position}`} />
      ))}
    </>
  );
}

/** Halo royal atrás da torre (estrutura/proteção): mais forte no Modo Torre, recua no Modo Touro. */
export function RoyalHalo({ mode, reduce }: { mode: VisualMode; reduce: boolean | null }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-34%] inset-y-[-16%]"
      variants={fadeIn}
      custom={stepFor(TIMELINE.halo, reduce)}
    >
      <motion.div
        className="size-full bg-[radial-gradient(closest-side,rgb(59_85_196/0.26),rgb(30_45_107/0.16)_48%,transparent)]"
        initial={{ opacity: 0.75, scale: 1 }}
        animate={{
          opacity: mode === "tower" ? 1 : mode === "bull" ? 0.4 : 0.75,
          scale: mode === "tower" ? 1.06 : 1,
        }}
        transition={MODE_SHIFT}
      />
    </motion.div>
  );
}

/** Piso: fita de LED sob a base e um reflexo royal difuso (a torre pousa sobre luz). */
export function LedFloor({ reduce }: { reduce: boolean | null }) {
  return (
    <>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-[95%] left-1/2 h-[10%] w-[120%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgb(59_85_196/0.32),transparent)]"
        variants={fadeIn}
        custom={stepFor(TIMELINE.floor, reduce)}
      />
      <div aria-hidden="true" className="pointer-events-none absolute top-[99%] left-[-10%] h-px w-[120%] opacity-70">
        <motion.div
          className="led-line size-full"
          variants={openLine}
          custom={stepFor(TIMELINE.floor, reduce)}
        />
      </div>
    </>
  );
}
