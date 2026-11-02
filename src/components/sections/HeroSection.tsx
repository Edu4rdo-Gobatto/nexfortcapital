import { ArrowUpRight, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { RookBullCenterpiece } from "@/components/motion/RookBullCenterpiece";
import { TextReveal } from "@/components/motion/TextReveal";
import { HeroFacade } from "@/components/sections/hero/HeroFacade";
import { HeroPulseDot } from "@/components/sections/hero/HeroPulseDot";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CtaLink } from "@/components/ui/CtaLink";
import { CONTACT, HERO, SECTION_IDS } from "@/content/nexfort";
import { cn } from "@/lib/utils";

const HEADING_ID = `${SECTION_IDS.hero}-titulo`;

/**
 * O selo da marca ("... EM SINOP • MT") quebra entre segmentos. Abaixo de 23rem o segmento longo não cabe
 * inteiro na coluna e quebra também entre palavras, mas a última palavra (tail) segue presa ao separador,
 * que assim nunca abre uma linha.
 */
const BADGE_SEGMENTS = HERO.badge
  .split("•")
  .map((segment) => segment.trim())
  .filter(Boolean)
  .map((segment) => {
    const tailStart = segment.lastIndexOf(" ") + 1;
    return { segment, head: segment.slice(0, tailStart), tail: segment.slice(tailStart) };
  });

/** Versão falada do selo: sem "•" para o leitor de tela soletrar. */
const BADGE_SPOKEN = `Consultoria financeira em ${CONTACT.address.city} - ${CONTACT.address.state}`;

const HQ_CITY = `${CONTACT.address.city} - ${CONTACT.address.state}`;

const NUMBERS = /(\d+(?:[.,]\d+)?)/;

/**
 * Ajuste dos CTAs (tamanho lg) ao hero: no celular, largura total, texto 14px (o rótulo do WhatsApp cabe
 * numa linha a partir de 360px) e altura livre se ainda assim quebrar; do sm em diante, a altura fixa do lg.
 */
const CTA_FIT = "h-auto min-h-14 w-full px-4 py-3 text-center text-sm text-balance sm:h-14 sm:px-7 sm:py-0 sm:text-[0.95rem]";

/** Números em JetBrains Mono (tabular). */
function Figures({ text }: { text: string }) {
  return text.split(NUMBERS).map((part, index) => {
    if (index % 2 === 0) return part;
    return (
      <span key={index} className="font-mono tracking-normal tabular-nums">
        {part}
      </span>
    );
  });
}

export function HeroSection() {
  return (
    <section
      id={SECTION_IDS.hero}
      aria-labelledby={HEADING_ID}
      className="relative isolate flex min-h-svh items-center overflow-x-clip pt-28 pb-16 sm:pt-32 sm:pb-24"
    >
      {/* Luz ambiente azul-real à esquerda: estrutura, proteção. Estática. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-14%] left-[-22%] h-[90%] w-[78%] bg-[radial-gradient(closest-side,rgb(59_85_196/0.16),transparent)]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-y-16 sm:gap-y-20 lg:grid-cols-12 lg:gap-x-8">
          {/* No topo da linha (não centralizado), como o emblema ao lado (lg:items-start): os CTAs ficam na primeira
              dobra e o selo se alinha à proa da fachada e ao topo do emblema. */}
          <div className="lg:col-span-7 lg:self-start">
            {/* Entradas em keyframes CSS (trigger="load"): começam no primeiro paint, sem esperar a hidratação. */}
            <Reveal trigger="load">
              <p className="relative isolate inline-flex max-w-full items-start gap-3 py-2 pr-4 pl-3 text-[0.6875rem] leading-[1.7] font-semibold tracking-[0.16em] text-led/85 [--cut:10px] sm:text-xs">
                <span aria-hidden="true" className="clip-chamfer absolute inset-0 -z-10 bg-white/12" />
                <span aria-hidden="true" className="clip-chamfer concrete-noise absolute inset-px -z-10 bg-concrete" />
                <HeroPulseDot />
                <span aria-hidden="true">
                  {BADGE_SEGMENTS.map(({ segment, head, tail }, index) => (
                    <span key={segment}>
                      <span className="min-[23rem]:whitespace-nowrap">
                        <Figures text={head} />
                        <span className="whitespace-nowrap">
                          <Figures text={tail} />
                          {index < BADGE_SEGMENTS.length - 1 ? (
                            <span className="mr-2.5 ml-2 inline-block size-0.75 align-middle bg-led/35" />
                          ) : null}
                        </span>
                      </span>
                      <wbr />
                    </span>
                  ))}
                </span>
                <span className="sr-only">{BADGE_SPOKEN}</span>
              </p>
            </Reveal>

            <TextReveal
              as="h1"
              id={HEADING_ID}
              text={HERO.headline}
              trigger="load"
              delay={0.15}
              stagger={0.07}
              className="mt-7 font-display text-[clamp(2.6rem,6vw,5.25rem)] leading-[1.02] font-semibold tracking-[0.01em] text-balance text-led sm:mt-9"
            />

            <Reveal
              as="p"
              trigger="load"
              delay={0.5}
              className="mt-6 max-w-[62ch] text-base leading-relaxed text-pretty text-muted sm:text-lg"
            >
              {HERO.subheadline}
            </Reveal>

            {/* Lado a lado quando cabem; ao quebrar, cada botão ocupa a linha inteira (nunca larguras desencontradas). */}
            <Reveal
              trigger="load"
              delay={0.65}
              className="mt-9 flex max-w-164 flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-4"
            >
              <CtaLink href={CONTACT.whatsappUrl} external size="lg" className={cn(CTA_FIT, "sm:w-auto sm:flex-auto")}>
                <WhatsAppIcon className="size-5 shrink-0" />
                {HERO.primaryCta}
              </CtaLink>
              <CtaLink
                href={`#${SECTION_IDS.simulator}`}
                variant="glass"
                size="lg"
                className={cn(CTA_FIT, "sm:w-auto sm:flex-auto")}
              >
                {HERO.secondaryCta}
              </CtaLink>
            </Reveal>

            <Reveal trigger="load" delay={0.8} className="mt-8">
              <a
                href={CONTACT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group/hq inline-flex items-start gap-2.5 text-sm leading-snug text-muted transition-[color] duration-200 ease-out-expo hover:text-led focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                <MapPin className="mt-px size-4 shrink-0 text-gold" />
                <span>
                  Sede própria: <Figures text={CONTACT.address.street} />,{" "}
                  {/* O hífen permite quebra mesmo entre espaços inseparáveis: "Sinop - MT" fica inteiro assim. */}
                  <span className="whitespace-nowrap">{HQ_CITY}</span>
                  <span className="sr-only"> (abre o Google Maps em nova aba)</span>
                </span>
                <ArrowUpRight className="mt-px size-4 shrink-0 transition-transform duration-300 ease-out-expo motion-safe:group-hover/hq:translate-x-0.75" />
              </a>
            </Reveal>
          </div>

          {/* A partir de 84rem (container com margem externa) o emblema avança sobre o padding: 488 → 520px. */}
          <div className="relative flex items-center justify-center lg:col-span-5 lg:items-start lg:self-stretch min-[84rem]:-mr-8">
            <HeroFacade />
            {/* Calor do touro: brasa âmbar → carmesim atrás do emblema. Ancorado no topo da coluna, onde o palco
                do emblema começa (lg:items-start; o touro fica ~17rem abaixo no celular, ~21rem com a torre na largura
                cheia). Estático. */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-68 left-1/2 -z-10 aspect-square w-[min(120%,38rem)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgb(234_88_12/0.17),rgb(185_28_28/0.07)_55%,transparent)] sm:top-84"
            />
            <RookBullCenterpiece className="w-full max-w-130" />
          </div>
        </div>
      </div>
    </section>
  );
}
