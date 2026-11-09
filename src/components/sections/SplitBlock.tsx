import { whatsappLink, type Block } from "@/content/nexfort";
import { cn } from "@/lib/cn";
import { Reveal } from "./Reveal";
import { TorreAnchor } from "./TorreAnchor";

/**
 * Bloco imagem/texto: a Torre de um lado (7 colunas, muito ar), o texto do outro (5 colunas, linha curta).
 * Sem moldura de card. No celular, Torre em cima e texto embaixo.
 */
export function SplitBlock({ block }: { block: Block }) {
  const torreLeft = block.torreSide === "left";
  const titleId = `${block.id}-titulo`;
  return (
    <section
      data-torre-section=""
      id={block.id}
      aria-labelledby={titleId}
      className="relative flex min-h-svh items-center px-(--gutter) py-24 lg:min-h-[120svh]"
    >
      <div className="mx-auto grid w-full max-w-(--page-max) grid-cols-1 items-center gap-y-10 lg:grid-cols-12 lg:gap-x-8">
        <TorreAnchor
          id={block.id}
          className={cn("h-[40svh] lg:row-start-1 lg:h-[74svh]", torreLeft ? "lg:col-span-7 lg:col-start-1" : "lg:col-span-7 lg:col-start-6")}
        />
        <Reveal className={cn("lg:row-start-1 lg:col-span-5", torreLeft ? "lg:col-start-8" : "lg:col-start-1")}>
          <p data-reveal-item="" className="eyebrow">
            <span className="tabular-nums">{block.number}</span>
            <span aria-hidden="true"> · </span>
            {block.area}
          </p>
          <h2 id={titleId} data-reveal-title="" className="display mt-6 text-[clamp(2.25rem,3.6vw,3.75rem)]">
            {block.title}
          </h2>
          <p data-reveal-item="" className="mt-7 max-w-[44ch] text-lg leading-relaxed text-ink-soft">
            {block.text}
          </p>
          <ul className="mt-9 border-t border-line">
            {block.items.map((item) => (
              <li key={item} data-reveal-item="" className="border-b border-line py-4">
                {item}
              </li>
            ))}
          </ul>
          <a
            data-reveal-item=""
            className="text-link mt-9 inline-flex"
            href={whatsappLink(block.cta.message)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {block.cta.label}
            <span aria-hidden="true" className="text-link__arrow">
              →
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
