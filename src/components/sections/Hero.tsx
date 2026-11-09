import type { CSSProperties } from "react";
import { hero, whatsappLink } from "@/content/nexfort";
import { ExternalLink } from "./ExternalLink";
import { TorreAnchor } from "./TorreAnchor";

const order = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Hero: o que a empresa faz, em uma frase, e um caminho para falar com ela. A Torre ocupa a direita, com a
 * frente virada para o texto. A entrada é CSS puro (keyframes no compositor): não espera o JavaScript. O texto
 * está à esquerda e entra da esquerda (no celular, sobe).
 */
export function Hero() {
  const lines = hero.titleLines;
  return (
    <section data-torre-section="" id="topo" className="relative flex min-h-svh items-center px-(--gutter) pt-24 pb-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-(--page-max) grid-cols-1 items-center gap-y-8 lg:grid-cols-12 lg:gap-x-8">
        {/* no celular a Torre é mais baixa (38svh): o botão cabe na primeira tela */}
        <TorreAnchor id="hero" face="frente" facing="esquerda" className="h-[38svh] lg:order-2 lg:col-span-5 lg:col-start-8 lg:h-[78svh]" />

        <div className="lg:order-1 lg:col-span-7">
          <p className="eyebrow hero-fade" style={order(0)}>
            {hero.eyebrow}
          </p>
          <h1 className="display mt-6 text-[clamp(3rem,6.2vw,6rem)]">
            {lines.map((line, i) => (
              <span key={line} className="hero-line" style={order(i + 1)}>
                {line}
                {i < lines.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <p className="hero-fade mt-8 max-w-[34ch] text-lg leading-relaxed text-ink-soft" style={order(lines.length + 1)}>
            {hero.lead}
          </p>
          <div className="hero-fade mt-10" style={order(lines.length + 2)}>
            <ExternalLink className="button" href={whatsappLink(hero.cta.message)}>
              {hero.cta.label}
            </ExternalLink>
          </div>
        </div>
      </div>
    </section>
  );
}
