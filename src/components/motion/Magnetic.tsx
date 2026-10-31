"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { SPRING_BOUNCY } from "@/lib/animations";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

type MagneticProps = {
  children: ReactNode;
  /** Fração da distância cursor → centro que o filho percorre (0–1). */
  strength?: number;
  className?: string;
};

/**
 * Atração magnética: o filho persegue o cursor com física de mola.
 * A medição é feita no invólucro estático (que não se move), evitando realimentação.
 */
export function Magnetic({ children, strength = 0.35, className }: MagneticProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion(); // null no servidor: lido apenas no handler
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING_BOUNCY);
  const springY = useSpring(y, SPRING_BOUNCY);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType === "touch" || !areaRef.current) return;
    const { left, top, width, height } = areaRef.current.getBoundingClientRect();
    x.set((event.clientX - (left + width / 2)) * strength);
    y.set((event.clientY - (top + height / 2)) * strength);
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div
      ref={areaRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn("inline-block w-fit", className)}
    >
      <motion.div style={{ x: springX, y: springY }}>{children}</motion.div>
    </div>
  );
}
