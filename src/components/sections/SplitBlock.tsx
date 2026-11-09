import { whatsappLink, type Block, type PartnersBlock } from "@/content/nexfort";
import { cn } from "@/lib/cn";
import { ExternalLink } from "./ExternalLink";
import { Reveal } from "./Reveal";
import { TorreAnchor } from "./TorreAnchor";

/** Lista de itens, etapas ou programas: filete âmbar no topo, linhas finas entre as linhas. */
const LIST = "mt-9 border-t-2 border-amber";

/** Corpo do bloco: o que muda de um bloco para outro vem dos dados (`kind`), não de um componente por seção. */
function Body({ block }: { block: Block }) {
  switch (block.kind) {
    case "items":
      return (
        <>
          <ul className={LIST}>
            {block.items.map((item) => (
              <li key={item} data-reveal-item="" className="border-b border-line py-4">
                {item}
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
      // etapas numeradas: aqui a numeração é informação, o conteúdo é uma sequência
      return (
        <ol className={LIST}>
          {block.steps.map((step, i) => (
            <li key={step.verb} data-reveal-item="" className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-b border-line py-4">
              <span aria-hidden="true" className="display text-[2.25rem] tabular-nums leading-none">
                {i + 1}
              </span>
              <div>
                <h3 className="display text-[1.5rem]">{step.verb}</h3>
                <p className="mt-1 text-sm font-medium text-ink-soft">{step.label}</p>
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
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="display text-[1.625rem]">{program.name}</h3>
                <span className="shrink-0 text-sm font-medium text-ink-soft">{program.mode}</span>
              </div>
              <p className="mt-3 text-ink-soft">{program.text}</p>
            </li>
          ))}
        </ul>
      );
    case "partners":
      return null; // os sócios ocupam o lado da imagem (Partners)
  }
}

/** Retratos provisórios: iniciais sobre o neutro tingido, nome e o que ainda falta confirmar. */
function Partners({ block }: { block: PartnersBlock }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8">
      {block.partners.map((partner) => (
        <figure key={partner.name} data-reveal-item="">
          <div aria-hidden="true" className="portrait">
            <span className="display portrait__initials">{partner.initials}</span>
          </div>
          <figcaption className="mt-5">
            <p className="display text-[1.375rem] sm:text-[1.625rem]">{partner.name}</p>
            <p className="mt-1 text-sm font-medium text-ink-soft">{partner.role}</p>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">{partner.bio}</p>
            <ExternalLink className="text-link mt-3 inline-flex text-sm" href={partner.instagram.url}>
              {partner.instagram.handle}
            </ExternalLink>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/**
 * Bloco imagem/texto: a imagem (a Torre; nos sócios, os retratos) de um lado (7 colunas, muito ar), o texto do
 * outro (5 colunas, linha curta). Sem moldura de card. No celular, imagem em cima e texto embaixo.
 * O texto e a imagem entram do lado em que estão (desktop) ou sobem (celular): ver Reveal.
 */
export function SplitBlock({ block }: { block: Block }) {
  const imageLeft = block.torre.side === "left";
  const titleId = `${block.id}-titulo`;
  const imageCols = cn("lg:row-start-1 lg:col-span-7", imageLeft ? "lg:col-start-1" : "lg:col-start-6");
  // a Torre fica virada para o lado do texto, que é o oposto dela; onde ela sai de cena, recua (metade do tamanho)
  const anchor = {
    id: block.id,
    face: block.torre.face,
    facing: imageLeft ? "direita" : "esquerda",
    hidden: block.torre.hidden,
    fill: block.torre.hidden ? 0.5 : undefined,
  } as const;
  return (
    <section
      data-torre-section=""
      id={block.id}
      aria-labelledby={titleId}
      className="relative flex min-h-svh items-center px-(--gutter) py-24 lg:min-h-[120svh]"
    >
      <div className="mx-auto grid w-full max-w-(--page-max) grid-cols-1 items-center gap-y-10 lg:grid-cols-12 lg:gap-x-8">
        {block.kind === "partners" ? (
          <Reveal from={block.torre.side} className={cn("relative", imageCols)}>
            <TorreAnchor {...anchor} className="absolute inset-0" />
            <Partners block={block} />
          </Reveal>
        ) : (
          <TorreAnchor {...anchor} className={cn("h-[40svh] lg:h-[74svh]", imageCols)} />
        )}
        <Reveal from={imageLeft ? "right" : "left"} className={cn("lg:row-start-1 lg:col-span-5", imageLeft ? "lg:col-start-8" : "lg:col-start-1")}>
          <p data-reveal-item="" className="eyebrow">
            <span className="tabular-nums">{block.number}</span>
            <span aria-hidden="true"> · </span>
            {block.area}
          </p>
          <h2 id={titleId} data-reveal-title="" className="display display-section mt-6">
            {block.title}
          </h2>
          <p data-reveal-item="" className="mt-7 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
            {block.text}
          </p>
          <Body block={block} />
          <ExternalLink data-reveal-item="" className="text-link mt-9 inline-flex" href={whatsappLink(block.cta.message)}>
            {block.cta.label}
            <span aria-hidden="true" className="text-link__arrow">
              →
            </span>
          </ExternalLink>
        </Reveal>
      </div>
    </section>
  );
}
