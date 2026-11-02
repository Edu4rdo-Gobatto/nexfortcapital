import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CtaLink } from "@/components/ui/CtaLink";
import { PILLARS, whatsappLink } from "@/content/nexfort";
import { cn } from "@/lib/utils";
import { LedTick } from "./PillarMotifs";
import { PillarSlab, type SlabCut } from "./PillarSlab";

type Pillar = (typeof PILLARS)[number];

/** `hero`: laje alta (2 linhas no bento). `standard`: coluna simples. `wide`: faixa horizontal. */
export type PillarLayout = "hero" | "standard" | "wide";

/** `royal`: estrutura e proteção. `bull`: multiplicação (marcadores e CTA dourados). */
export type PillarTone = "royal" | "bull";

type PillarCardProps = {
  pillar: Pillar;
  layout: PillarLayout;
  tone: PillarTone;
  cut: SlabCut;
  /** Motivo vetorial já dimensionado (Server Component). */
  motif: ReactNode;
  /** Posição no grid do bento. */
  className?: string;
  /** Atraso da entrada (s). */
  delay?: number;
};

/** Card de pilar: <article> ancorável (ids da navbar) com a laje de concreto e o CTA de WhatsApp com contexto. */
export function PillarCard({ pillar, layout, tone, cut, motif, className, delay }: PillarCardProps) {
  const titleId = `${pillar.id}-titulo`;
  const title = (
    <h3 id={titleId} className="font-display text-xl tracking-[0.03em] text-led sm:text-2xl">
      {pillar.title}
    </h3>
  );
  const cta = <PillarCta pillar={pillar} tone={tone} />;

  return (
    <article id={pillar.id} aria-labelledby={titleId} className={cn("", className)}>
      <Reveal className="h-full" delay={delay}>
        <PillarSlab cut={cut}>
          {layout === "wide" ? (
            <div className="grid h-full gap-y-6 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] lg:p-10 xl:gap-x-14">
              <div className="justify-self-end md:col-start-2 md:row-span-3 md:row-start-1 md:self-end lg:col-start-3 lg:row-span-2">
                {motif}
              </div>
              <div className="md:col-start-1 md:row-start-1">
                {title}
                <p className="mt-3 max-w-[48ch] text-base leading-relaxed text-muted">{pillar.summary}</p>
              </div>
              <PillarItems
                items={pillar.items}
                tone={tone}
                className="sm:grid-cols-2 sm:gap-x-8 md:col-start-1 md:row-start-2 md:grid-cols-1 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-1.5"
              />
              <div className="pt-2 md:col-start-1 md:row-start-3 lg:row-start-2 lg:self-end">{cta}</div>
            </div>
          ) : layout === "hero" ? (
            <div className="flex h-full flex-col p-6 sm:p-8 lg:p-10">
              {/* A área do motivo cresce com a laje (o card estica na linha dupla do bento). */}
              <div className="relative min-h-40 flex-1 sm:min-h-52">{motif}</div>
              <div className="pt-8 sm:pt-10">
                {title}
                <p className="mt-3 max-w-[52ch] text-base leading-relaxed text-muted sm:text-lg">{pillar.summary}</p>
                <PillarItems items={pillar.items} tone={tone} className="mt-6 xl:grid-cols-2 xl:gap-x-8" />
                <div className="mt-8">{cta}</div>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col p-6 sm:p-8 lg:p-10">
              {motif}
              <div className="mt-6">{title}</div>
              <p className="mt-3 text-base leading-relaxed text-muted">{pillar.summary}</p>
              <PillarItems items={pillar.items} tone={tone} className="mt-5" />
              <div className="mt-auto pt-8">{cta}</div>
            </div>
          )}
        </PillarSlab>
      </Reveal>
    </article>
  );
}

function PillarItems({ items, tone, className }: { items: readonly string[]; tone: PillarTone; className?: string }) {
  return (
    // role="list": o Safari remove a semântica de lista quando list-style é none (preflight do Tailwind).
    <ul role="list" className={cn("grid content-start gap-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed text-led/85">
          <span aria-hidden="true" className="flex h-lh shrink-0 items-center">
            <LedTick tone={tone} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Abre o WhatsApp com uma mensagem que já diz de qual pilar a pessoa quer falar. */
function PillarCta({ pillar, tone }: { pillar: Pillar; tone: PillarTone }) {
  return (
    <CtaLink
      href={whatsappLink(`Olá, vim pelo site da Nexfort Capital e quero falar sobre ${pillar.title}.`)}
      external
      size="md"
      variant={tone === "bull" ? "gold" : "glass"}
    >
      <WhatsAppIcon className="size-4 shrink-0" />
      Falar com especialista
      <span className="sr-only"> em {pillar.title} pelo WhatsApp</span>
    </CtaLink>
  );
}
