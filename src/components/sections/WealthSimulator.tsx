import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { SECTION_IDS } from "@/content/nexfort";
import { SimulatorConsole } from "./simulator/SimulatorConsole";

const TITLE_ID = `${SECTION_IDS.simulator}-titulo`;

/**
 * "O Efeito Nexfort": simulador patrimonial interativo.
 * Server Component: o cabeçalho é estático; a interatividade fica no SimulatorConsole (cliente).
 */
export function WealthSimulator() {
  return (
    <section
      id={SECTION_IDS.simulator}
      aria-labelledby={TITLE_ID}
      className="relative overflow-x-clip py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h2
            id={TITLE_ID}
            className="font-display text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.06] font-semibold tracking-[0.015em] text-led lg:col-span-6"
          >
            <TextReveal as="span" text="O Efeito Nexfort" />
          </h2>
          <Reveal
            as="p"
            className="max-w-[62ch] text-base leading-relaxed text-muted sm:text-lg lg:col-span-6 lg:justify-self-end"
          >
            Mova os controles e compare, ano a ano, o mesmo dinheiro em dois caminhos: a poupança tradicional e um
            cenário hipotético com a metodologia Torre & Touro. É uma simulação ilustrativa, não uma promessa de
            retorno.
          </Reveal>
        </div>

        <SimulatorConsole className="mt-12 sm:mt-16" />
      </div>
    </section>
  );
}
