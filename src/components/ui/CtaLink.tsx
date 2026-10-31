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
 * Link com cara de botão e canto chanfrado. O recorte fica nas camadas internas,
 * então o anel de foco do teclado nunca é cortado. Hover anima só opacity/transform.
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
      {/* Varredura de LED no hover: só transform + opacity. */}
      <span aria-hidden className="clip-chamfer pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="absolute inset-y-0 -left-1/2 w-1/2 -translate-x-full skew-x-[-32deg] bg-linear-to-r from-transparent via-white/35 to-transparent opacity-0 transition-[translate,opacity] duration-700 ease-out-expo group-hover/cta:translate-x-[320%] group-hover/cta:opacity-100 motion-reduce:hidden" />
      </span>
      {children}
      {external ? <span className="sr-only"> (abre em nova aba)</span> : null}
    </a>
  );
}
