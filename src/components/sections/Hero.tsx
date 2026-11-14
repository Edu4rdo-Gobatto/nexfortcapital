import type { CSSProperties } from "react";
import { areas, hero, whatsappLink } from "@/content/nexfort";
import { ExternalLink } from "./ExternalLink";
import { TorreAnchor } from "./TorreAnchor";

const order = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * Hero: o que a empresa faz, em uma frase, e dois caminhos: conversar agora ou descobrir a própria etapa no
 * diagnóstico. A Torre ocupa a direita, com a frente virada para o texto, diante de um arco com o degradê do
 * logo. No pé da primeira tela (desktop), as três frentes como índice, cada uma com a sua cor. A entrada é CSS
 * puro (keyframes no compositor): não espera o JavaScript. O texto está à esquerda e entra da esquerda (no
 * celular, sobe).
 */
export function Hero() {
  const lines = hero.titleLines;
  return (
    <section data-torre-section="" id="topo" className="relative flex min-h-svh items-center px-(--gutter) pt-24 pb-16 lg:py-24">
      <div className="mx-auto grid w-full max-w-(--page-max) grid-cols-1 items-center gap-y-6 lg:grid-cols-12 lg:gap-x-8">
        {/* no celular a Torre é mais baixa (31svh): os dois caminhos cabem na primeira tela */}
        <TorreAnchor id="hero" face="frente" facing="esquerda" niche="sun" className="h-[31svh] lg:order-2 lg:col-span-5 lg:col-start-8 lg:h-[78svh]" />

        <div className="layer lg:order-1 lg:col-span-7">
          <p className="eyebrow hero-fade" style={order(0)}>
            {hero.eyebrow}
          </p>
          <h1 className="display mt-5 text-[clamp(3rem,6.2vw,6rem)]">
            {lines.map((line, i) => (
              <span key={line} className="hero-line" style={order(i + 1)}>
                {line}
                {i < lines.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <p className="hero-fade mt-6 max-w-[40ch] text-lg leading-relaxed text-ink-soft lg:mt-8" style={order(lines.length + 1)}>
            {hero.lead}
          </p>
          <div className="hero-fade mt-8 flex flex-col gap-x-8 gap-y-5 sm:flex-row sm:items-center lg:mt-10" style={order(lines.length + 2)}>
            <ExternalLink className="button" href={whatsappLink(hero.cta.message)}>
              {hero.cta.label}
            </ExternalLink>
            <a className="text-link self-start sm:self-auto" href={hero.secondary.href}>
              {hero.secondary.label}
            </a>
          </div>
        </div>
      </div>

      {/* índice das três frentes, no pé da primeira tela: só onde sobra altura (desktop) */}
      <nav aria-label="Frentes de atuação" className="layer hero-fade !absolute inset-x-(--gutter) bottom-7 hidden lg:block" style={order(lines.length + 3)}>
        <ul className="mx-auto flex w-full max-w-(--page-max) gap-x-10 text-sm">
          {hero.index.map((key) => (
            <li key={key}>
              <a className="hero-index" data-area={key} href={areas[key].href}>
                {areas[key].label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
