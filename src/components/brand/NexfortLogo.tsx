import { cn } from "@/lib/utils";

/** A Torre da logo original, reconstruída em alta resolução por design/motion/extract_logo.py (774×1458). */
export const EMBLEM_SRC = "/brand/nexfort-torre.png";
export const EMBLEM_SIZE = { width: 774, height: 1458 } as const;

type NexfortEmblemProps = {
  className?: string;
  /** Nome acessível. Sem título, o emblema é tratado como decorativo. */
  title?: string;
};

/** Emblema estático: a Torre da logo original, idêntica (com o touro e o urso no miolo). */
export function NexfortEmblem({ className, title }: NexfortEmblemProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- PNG pequeno e já no tamanho final; next/image não ganha nada aqui.
    <img
      src={EMBLEM_SRC}
      width={EMBLEM_SIZE.width}
      height={EMBLEM_SIZE.height}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      decoding="async"
      className={cn("object-contain", className)}
    />
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
