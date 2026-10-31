import { useId } from "react";
import { BULL_PATH, EMBLEM_VIEWBOX, ROOK_GROOVE_PATH, ROOK_PATH } from "@/components/brand/geometry";
import { cn } from "@/lib/utils";

type NexfortEmblemProps = {
  className?: string;
  /** Nome acessível. Sem título, o emblema é tratado como decorativo. */
  title?: string;
  /** Contorno LED sutil — melhora a leitura sobre fundos escuros. */
  outline?: boolean;
};

/** Emblema estático: Torre de xadrez com o Touro esculpido em espaço negativo. */
export function NexfortEmblem({ className, title, outline = true }: NexfortEmblemProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rookFill = `${uid}-rook`;
  const bullFill = `${uid}-bull`;
  const rookClip = `${uid}-clip`;

  return (
    <svg
      viewBox={EMBLEM_VIEWBOX}
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id={rookFill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B3E94" />
          <stop offset="1" stopColor="#121A45" />
        </linearGradient>
        <linearGradient id={bullFill} gradientUnits="userSpaceOnUse" x1="80" y1="131" x2="80" y2="203">
          <stop offset="0" stopColor="#F59E0B" />
          <stop offset="0.55" stopColor="#EA580C" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
        <clipPath id={rookClip}>
          <path d={ROOK_PATH} />
        </clipPath>
      </defs>
      <path d={ROOK_PATH} fill={`url(#${rookFill})`} />
      <path d={BULL_PATH} fill={`url(#${bullFill})`} clipPath={`url(#${rookClip})`} />
      {outline ? (
        <>
          <path d={ROOK_PATH} fill="none" stroke="#F8FAFC" strokeOpacity={0.32} strokeWidth={1.2} />
          <path d={ROOK_GROOVE_PATH} stroke="#F8FAFC" strokeOpacity={0.22} strokeWidth={0.8} />
        </>
      ) : null}
    </svg>
  );
}

type NexfortLogoProps = {
  className?: string;
  emblemClassName?: string;
  /** Exibe a linha "Finanças Empresariais | Finanças Pessoais | Investimentos". */
  showTagline?: boolean;
};

/** Assinatura horizontal: emblema + "NEXFORT CAPITAL" em Cinzel (texto real, acessível). */
export function NexfortLogo({ className, emblemClassName, showTagline = false }: NexfortLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <NexfortEmblem className={cn("h-9 w-auto shrink-0", emblemClassName)} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-semibold tracking-[0.08em] text-led">NEXFORT CAPITAL</span>
        {showTagline ? (
          <span className="mt-1.5 font-display text-[0.55rem] leading-relaxed font-medium tracking-[0.2em] text-muted">
            FINANÇAS EMPRESARIAIS | FINANÇAS PESSOAIS | INVESTIMENTOS
          </span>
        ) : null}
      </span>
    </span>
  );
}
