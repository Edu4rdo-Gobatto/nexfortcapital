import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type CtaVariant = "gold" | "glass";
type CtaSize = "md" | "lg" | "xl";

type CtaLinkProps = ComponentProps<"a"> & {
  variant?: CtaVariant;
  size?: CtaSize;
  /** Abre em nova aba com rel seguro (WhatsApp, Maps, Instagram) e avisa leitores de tela. */
  external?: boolean;
};

const SIZES: Record<CtaSize, string> = {
  md: "h-11 px-5 text-sm [--cut:10px]",
  lg: "h-14 px-7 text-[0.95rem] [--cut:14px]",
  xl: "h-16 px-8 text-base sm:h-20 sm:px-12 sm:text-xl [--cut:18px] sm:[--cut:22px]",
};

const TEXT: Record<CtaVariant, string> = {
  gold: "text-ink",
  glass: "text-led",
};

/**
 * Realce no hover/foco (só opacity): o ouro passa à rampa um tom acima (mais contraste com o texto ink, sem lavar
 * a cor); no vidro, borda e fundo clareiam de leve.
 */
const LIFT: Record<CtaVariant, string> = {
  gold: "bg-cta-gradient-lit group-hover/cta:opacity-100 group-focus-visible/cta:opacity-100",
  glass: "bg-white group-hover/cta:opacity-8 group-focus-visible/cta:opacity-8",
};

/** Seta interna do CTA: avança 3px no hover (só transform). */
export const CTA_ARROW = "transition-[translate] duration-300 ease-out-expo motion-safe:group-hover/cta:translate-x-0.75";

/**
 * Link com cara de botão e canto chanfrado. O recorte fica nas camadas internas,
 * então o anel de foco do teclado nunca é cortado. No hover/foco a placa clareia (LIFT, só opacity);
 * no hover, a seta interna avança 3px (CTA_ARROW). Sem varredura de brilho.
 */
export function CtaLink({
  variant = "gold",
  size = "lg",
  external = false,
  className,
  children,
  target,
  rel,
  ...props
}: CtaLinkProps) {
  return (
    <a
      {...props}
      target={external ? "_blank" : target}
      rel={external ? "noopener noreferrer" : rel}
      className={cn(
        "group/cta relative isolate inline-flex select-none items-center justify-center gap-2.5 font-semibold tracking-[0.01em]",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
        variant === "gold" && "drop-shadow-[0_10px_28px_rgb(245_158_11/0.28)]",
        SIZES[size],
        TEXT[variant],
        className,
      )}
    >
      {variant === "gold" ? (
        <span aria-hidden className="clip-chamfer bg-cta-gradient absolute inset-0 -z-10" />
      ) : (
        <>
          <span aria-hidden className="clip-chamfer absolute inset-0 -z-10 bg-white/15" />
          <span aria-hidden className="clip-chamfer absolute inset-px -z-10 bg-[#0b1020]/80 backdrop-blur-md" />
        </>
      )}
      {/* Realce do hover/foco: camada acima da placa e abaixo do texto (só opacity). */}
      <span
        aria-hidden
        className={cn(
          "clip-chamfer pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 ease-out-expo",
          LIFT[variant],
        )}
      />
      {children}
      {external ? <span className="sr-only"> (abre em nova aba)</span> : null}
    </a>
  );
}
