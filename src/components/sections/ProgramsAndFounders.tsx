import { ArrowUpRight } from "lucide-react";
import { NexfortEmblem } from "@/components/brand/NexfortLogo";
import { TextReveal } from "@/components/motion/TextReveal";
import { InstagramIcon } from "@/components/ui/BrandIcons";
import { BRAND, FOUNDERS, SECTION_IDS } from "@/content/nexfort";
import { cn } from "@/lib/utils";
import { LED_GLOW } from "./programs/led";
import { ProgramShowcase } from "./programs/ProgramShowcase";
import { RookMonogram } from "./programs/RookMonogram";

const TITLE_ID = `${SECTION_IDS.programs}-titulo`;

// A missão se divide no ":" entre a causa e os três resultados (empresas, famílias, investidores).
const MISSION_BREAK = BRAND.mission.indexOf(":");
const MISSION_LEAD = MISSION_BREAK === -1 ? BRAND.mission : BRAND.mission.slice(0, MISSION_BREAK + 1);
const MISSION_REST = MISSION_BREAK === -1 ? "" : BRAND.mission.slice(MISSION_BREAK + 1).trim();

/**
 * Sócios: monograma na torre + nome e cargo ao pé dela; o Instagram ocupa uma faixa própria
 * na largura toda do cartão, então o @ nunca é cortado. O recorte 4/8 só a partir de xl.
 */
function Founders() {
  return (
    <div className="mt-24 grid gap-8 sm:mt-32 xl:grid-cols-12 xl:gap-12">
      <div className="xl:col-span-4">
        <h3 className="font-display text-xl tracking-[0.03em] text-led sm:text-2xl">Os sócios</h3>
        <p className="mt-3 max-w-[36ch] text-base leading-relaxed text-muted">
          Acompanhe o trabalho de cada um no Instagram.
        </p>
      </div>

      <ul className="grid border-t border-white/8 md:grid-cols-2 xl:col-span-8">
        {FOUNDERS.map((founder, index) => (
          <li
            key={founder.handle}
            className={cn(
              "grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 py-8 sm:gap-x-7 sm:py-10",
              index > 0 ? "border-t border-white/8 md:border-t-0 md:border-l md:pl-10" : "md:pr-10",
            )}
          >
            <RookMonogram initials={founder.initials} className="h-32 w-auto sm:h-40 md:h-36 lg:h-40" />
            <div className="self-end pb-1">
              <h4 className="font-display text-xl leading-tight tracking-[0.03em] text-led sm:text-2xl">
                {founder.name}
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{founder.role}</p>
            </div>
            <div className="col-span-2 mt-6 border-t border-white/8 pt-5">
              <a
                href={founder.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Instagram de ${founder.name} (${founder.handle}), abre em nova aba`}
                className="group/ig inline-flex max-w-full items-center gap-2.5 text-sm font-medium text-led hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold sm:text-base"
              >
                <InstagramIcon className="size-4 shrink-0 sm:size-5" />
                <span className="min-w-0 truncate underline decoration-white/25 underline-offset-4 group-hover/ig:decoration-gold">
                  {founder.handle}
                </span>
                <ArrowUpRight className="size-4 shrink-0 group-hover/ig:translate-x-0.5 group-hover/ig:-translate-y-0.5 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out-expo" />
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A missão gravada numa placa de concreto com o corte da fachada: a aresta desce a 32°
 * (96 × 60 px no celular, 160 × 100 px a partir de sm) e recebe a fita de LED.
 * A placa é o próprio <figure> (o figcaption é filho direto dele); o LED, fora do recorte, fica no invólucro.
 */
function Mission() {
  return (
    <div className="relative mt-24 [--cut-x:96px] [--cut-y:60px] sm:mt-32 sm:[--cut-x:160px] sm:[--cut-y:100px]">
      <figure className="concrete-noise border border-white/8 bg-concrete px-6 pt-16 pb-10 [clip-path:polygon(0_0,calc(100%_-_var(--cut-x))_0,100%_var(--cut-y),100%_100%,0_100%)] sm:px-12 sm:pt-20 sm:pb-14 lg:px-20 lg:pt-24 lg:pb-16">
        <blockquote>
          <p className="max-w-[30ch] font-display text-[clamp(1.5rem,3.4vw,2.75rem)] leading-[1.2] tracking-[0.01em] text-pretty text-led">
            {MISSION_LEAD} <span className="text-muted">{MISSION_REST}</span>
          </p>
        </blockquote>
        <figcaption className="mt-10 flex items-center gap-3 text-sm text-muted sm:mt-12">
          <NexfortEmblem className="h-8 w-auto shrink-0" />
          <span>
            Missão da{" "}
            <span className="font-display font-semibold tracking-[0.06em] text-led">{BRAND.shortName}</span>
          </span>
        </figcaption>
      </figure>
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-0 left-[calc(100%-var(--cut-x))] h-px w-[113px] origin-left rotate-32 bg-linear-to-r from-led via-led to-led/40 sm:w-[189px]",
          LED_GLOW,
        )}
      />
    </div>
  );
}

/**
 * Programas (Imersão Torre Mestra e Finance Pro), os sócios e a missão da Nexfort Capital.
 * Server Component: só a vitrine de abas é client.
 */
export function ProgramsAndFounders() {
  return (
    <section
      id={SECTION_IDS.programs}
      aria-labelledby={TITLE_ID}
      className="relative overflow-x-clip py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12">
          <h2
            id={TITLE_ID}
            className="font-display text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.06] font-semibold tracking-[0.015em] text-balance text-led lg:col-span-7"
          >
            <TextReveal as="span" text="Formação e consultoria que mudam decisões" className="block" />
          </h2>
          <p className="max-w-[62ch] text-base leading-relaxed text-muted sm:text-lg lg:col-span-5 lg:pb-1">
            Dois programas para empresários e investidores que querem decidir com método. Escolha um para ver os
            detalhes.
          </p>
        </header>

        <ProgramShowcase className="mt-12 sm:mt-16" />
        <Founders />
        <Mission />
      </div>
    </section>
  );
}
