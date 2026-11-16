import type { CSSProperties } from "react";
import { PART_CENTERS } from "@/components/torre/parts";
import { whatsappLink, type Block, type StepsBlock, type TorrePart } from "@/content/nexfort";
import { cn } from "@/lib/cn";
import { ExternalLink } from "./ExternalLink";
import { Reveal } from "./Reveal";
import { TorreAnchor } from "./TorreAnchor";

/** Lista de itens, etapas, programas ou sócios: um filete marinho no topo e linhas finas entre as linhas. */
const LIST = "list-rule mt-9";

/** Corpo do bloco: o que muda de um bloco para outro vem dos dados (`kind`), não de um componente por seção. */
function Body({ block }: { block: Block }) {
  switch (block.kind) {
    case "items":
      return (
        <>
          {block.situation ? (
            <p data-reveal-item="" className="display mt-8 text-[clamp(1.5rem,2vw,1.875rem)] leading-[1.15] tracking-[-0.012em]">
              {block.situation}
            </p>
          ) : null}
          <ul className={LIST}>
            {block.items.map((item) => (
              <li key={item.title} data-reveal-item="" className="border-b border-line py-4">
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-[0.9375rem] text-ink-soft">{item.text}</p>
              </li>
            ))}
          </ul>
          {block.note ? (
            <p data-reveal-item="" className="mt-4 text-sm text-ink-soft">
              {block.note}
            </p>
          ) : null}
        </>
      );
    case "steps":
      // etapas numeradas: aqui a numeração é informação, o conteúdo é uma sequência (e a ordem das partes da Torre)
      return (
        <ol className={cn(LIST, "mt-7")}>
          {block.steps.map((step, i) => (
            <li key={step.verb} data-reveal-item="" className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-b border-line py-3">
              <span aria-hidden="true" className="display text-[2.25rem] tabular-nums leading-none">
                {i + 1}
              </span>
              <div>
                <h3 className="display text-[1.5rem]">{step.verb}</h3>
                <p className="mt-1 text-sm font-medium text-ink-soft">
                  {step.partName}: {step.label.toLowerCase()}
                </p>
                <p className="mt-2 text-ink-soft">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "programs":
      return (
        <ul className={LIST}>
          {block.programs.map((program) => (
            <li key={program.name} data-reveal-item="" className="border-b border-line py-5">
              <h3 className="display text-[1.625rem]">{program.name}</h3>
              <p className="mt-1 text-sm font-medium text-ink-soft">{program.mode}</p>
              <p className="mt-3 text-ink-soft">{program.text}</p>
              <p className="mt-2 text-[0.9375rem] font-medium">{program.audience}</p>
            </li>
          ))}
        </ul>
      );
    case "partners":
      // sem foto ainda: o nome na serifa dos títulos e o Instagram; cargo e biografia entram quando existirem
      return (
        <ul className={LIST}>
          {block.partners.map((partner) => (
            <li key={partner.name} data-reveal-item="" className="border-b border-line py-5">
              <p className="display text-[1.75rem] leading-tight">{partner.name}</p>
              {partner.role ? <p className="mt-1 text-sm font-medium text-ink-soft">{partner.role}</p> : null}
              {partner.bio ? <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">{partner.bio}</p> : null}
              <ExternalLink className="text-link mt-3 inline-flex text-[0.9375rem]" href={partner.instagram.url}>
                {partner.instagram.handle}
              </ExternalLink>
            </li>
          ))}
        </ul>
      );
  }
}

/**
 * Meia largura de cada parte da Torre desmontada, em % da altura da âncora (o raio no meio da parte, mais uma
 * folga): é onde começa o filete que liga a parte ao nome da etapa.
 */
const PART_REACH: Record<TorrePart, number> = { base: 24, body: 17, crown: 21 };

/**
 * Os nomes das etapas ao lado de cada parte da Torre desmontada. Só aparecem com a Torre 3D aberta (o palco
 * acende a lista); a informação de verdade está na lista numerada do texto, então isto é só desenho.
 */
function StepLabels({ block }: { block: StepsBlock }) {
  return (
    <ol data-torre-labels="" className="torre-labels">
      {block.steps.map((step, i) => (
        <li key={step.part} style={{ "--at": PART_CENTERS[step.part], "--reach": PART_REACH[step.part] } as CSSProperties}>
          <span className="torre-labels__line" />
          <span className="display torre-labels__number">{i + 1}</span>
          <span className="torre-labels__name">
            {step.verb}
            <small>{step.partName}</small>
          </span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Bloco imagem/texto: a imagem (a Torre) de um lado (7 colunas, muito ar), o texto do outro (5 colunas, linha
 * curta). Sem moldura de card e sem nada colorido atrás da Torre: ela é a única coisa colorida do bloco. No
 * celular, imagem em cima e texto embaixo. O texto e a imagem entram do lado em que estão (desktop) ou sobem
 * (celular): ver Reveal.
 *
 * O bloco do método tem o fundo um tom mais fundo (`paper-deep`), para marcar a seção em que a Torre se desmonta.
 */
export function SplitBlock({ block }: { block: Block }) {
  const imageLeft = block.torre.side === "left";
  const titleId = `${block.id}-titulo`;
  const imageCols = cn("lg:row-start-1 lg:col-span-7", imageLeft ? "lg:col-start-1" : "lg:col-start-6");
  // a Torre fica virada para o lado do texto, que é o oposto dela
  const anchor = {
    id: block.id,
    face: block.torre.face,
    facing: imageLeft ? "direita" : "esquerda",
  } as const;
  return (
    <section
      data-torre-section=""
      id={block.id}
      aria-labelledby={titleId}
      className={cn("relative flex min-h-svh items-center px-(--gutter) py-24 lg:min-h-[120svh]", block.kind === "steps" && "bg-paper-deep")}
    >
      <div className="mx-auto grid w-full max-w-(--page-max) grid-cols-1 items-center gap-y-10 lg:grid-cols-12 lg:gap-x-8">
        {block.kind === "steps" ? (
          // o método: a Torre se desmonta aqui. No celular a âncora é mais estreita e fica à esquerda, para os
          // nomes das etapas caberem ao lado das partes
          <TorreAnchor {...anchor} explode className={cn("h-[46svh] w-[60%] lg:h-[80svh] lg:w-auto", imageCols)}>
            <StepLabels block={block} />
          </TorreAnchor>
        ) : (
          <TorreAnchor {...anchor} className={cn("h-[40svh] lg:h-[74svh]", imageCols)} />
        )}
        <Reveal from={imageLeft ? "right" : "left"} className={cn("lg:row-start-1 lg:col-span-5", imageLeft ? "lg:col-start-8" : "lg:col-start-1")}>
          <p data-reveal-item="" className="eyebrow">
            {block.area}
          </p>
          <h2 id={titleId} data-reveal-title="" className="display display-section mt-5">
            {block.title}
          </h2>
          <p data-reveal-item="" className="mt-6 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
            {block.text}
          </p>
          <Body block={block} />
          <ExternalLink data-reveal-item="" className="text-link mt-8 inline-flex" href={whatsappLink(block.cta.message)}>
            {block.cta.label}
          </ExternalLink>
        </Reveal>
      </div>
    </section>
  );
}
