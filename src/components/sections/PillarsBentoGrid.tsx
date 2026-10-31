import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { PILLARS, SECTION_IDS } from "@/content/nexfort";
import { PillarCard } from "./pillars/PillarCard";
import { BalanceShieldMotif, BullMotif, RookCrownMotif } from "./pillars/PillarMotifs";

const HEADING_ID = `${SECTION_IDS.pillars}-titulo`;
const HEADING = "Três pilares, uma estratégia patrimonial";
const INTRO =
  "Empresa, orçamento da família e carteira de investimentos seguem o mesmo método: primeiro organizar a base, depois multiplicar. Comece pela frente que mais pesa hoje.";

/**
 * Bento dos três pilares. O título ocupa a primeira célula do grid; Finanças Empresariais é a laje alta,
 * Finanças Pessoais a laje padrão e Investimentos & Bolsa a faixa larga. No mobile, tudo empilha.
 *
 *   md (2 col.)              lg (12 col.)
 *   [título ] [empresas]     [título 1–5 ] [empresas 6–12]
 *   [pessoal] [empresas]     [pessoal 1–5] [empresas 6–12]
 *   [   investimentos  ]     [      investimentos 1–12     ]
 */
export function PillarsBentoGrid() {
  const [business, personal, investments] = PILLARS;

  return (
    <section
      id={SECTION_IDS.pillars}
      aria-labelledby={HEADING_ID}
      className="relative overflow-x-clip py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          <header className="pb-7 md:col-start-1 md:row-start-1 md:pr-4 md:pb-10 lg:col-span-5 lg:col-start-1 lg:pr-6">
            <h2
              id={HEADING_ID}
              className="font-display text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.06] font-semibold tracking-[0.015em] text-led"
            >
              <TextReveal as="span" text={HEADING} />
            </h2>
            <Reveal as="p" delay={0.15} className="mt-6 max-w-[62ch] text-base leading-relaxed text-muted sm:text-lg">
              {INTRO}
            </Reveal>
          </header>

          <PillarCard
            pillar={business}
            layout="hero"
            tone="royal"
            cut="xl"
            delay={0.1}
            motif={<RookCrownMotif className="absolute inset-0 size-full" />}
            className="md:col-start-2 md:row-span-2 md:row-start-1 lg:col-span-7 lg:col-start-6"
          />
          <PillarCard
            pillar={personal}
            layout="standard"
            tone="royal"
            cut="md"
            motif={<BalanceShieldMotif className="h-16 w-auto self-start sm:h-20" />}
            className="md:col-start-1 md:row-start-2 lg:col-span-5 lg:col-start-1"
          />
          <PillarCard
            pillar={investments}
            layout="wide"
            tone="bull"
            cut="lg"
            motif={<BullMotif className="h-20 sm:h-24 lg:h-28 xl:h-36" />}
            className="md:col-span-2 lg:col-span-12"
          />
        </div>
      </div>
    </section>
  );
}
