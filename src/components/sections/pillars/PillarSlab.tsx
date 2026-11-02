import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Chanfro do canto superior direito. A superfície (inset 1px) corta ~0,6px a menos
 * (c − 2 + √2) para que o filete diagonal tenha a mesma espessura de 1px das bordas retas.
 */
const CUTS = {
  md: { ring: "[--cut:18px]", surface: "[--cut:17.4px]" },
  lg: { ring: "[--cut:22px] lg:[--cut:28px]", surface: "[--cut:21.4px] lg:[--cut:27.4px]" },
  xl: { ring: "[--cut:26px] lg:[--cut:36px]", surface: "[--cut:25.4px] lg:[--cut:35.4px]" },
} as const;

export type SlabCut = keyof typeof CUTS;

type PillarSlabProps = {
  children: ReactNode;
  cut?: SlabCut;
  className?: string;
};

/**
 * Laje de concreto do pilar: filete de 1px que acompanha o chanfro + superfície opaca.
 * Estática (sem inclinação nem luz seguindo o cursor).
 * O conteúdo fica fora das camadas recortadas, então o anel de foco dos links nunca é cortado.
 */
export function PillarSlab({ children, cut = "md", className }: PillarSlabProps) {
  const cuts = CUTS[cut];

  return (
    <div className={cn("relative isolate h-full", className)}>
      <div aria-hidden="true" className={cn("clip-chamfer absolute inset-0 bg-white/8", cuts.ring)} />
      <div
        aria-hidden="true"
        className={cn("clip-chamfer concrete-noise absolute inset-px bg-concrete", cuts.surface)}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
