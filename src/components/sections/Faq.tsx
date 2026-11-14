import { faq, whatsappLink } from "@/content/nexfort";
import { ExternalLink } from "./ExternalLink";
import { Reveal } from "./Reveal";
import { TorreAnchor } from "./TorreAnchor";

/**
 * Perguntas frequentes, antes da assinatura. Cada pergunta é um <details> nativo: abre com teclado, funciona
 * sem JavaScript e o leitor de tela anuncia o estado. A resposta só aparece (opacidade e um pequeno
 * deslocamento) quando a pessoa abre. Fundo lilás, opaco: a Torre segue fora de cena até a assinatura.
 */
export function Faq() {
  const titleId = `${faq.id}-titulo`;
  return (
    <section data-torre-section="" id={faq.id} aria-labelledby={titleId} className="layer bg-paper-deep px-(--gutter) py-24 lg:py-32">
      <TorreAnchor id={faq.id} hidden fill={0.5} className="pointer-events-none !absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-(--page-max) grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-8">
        <Reveal from="left" className="lg:col-span-4">
          <p data-reveal-item="" className="eyebrow">
            {faq.area}
          </p>
          <h2 id={titleId} data-reveal-title="" className="display display-section mt-5">
            {faq.title}
          </h2>
          <p data-reveal-item="" className="mt-7 text-lg leading-relaxed text-ink-soft">
            {faq.lead}
          </p>
          <ExternalLink data-reveal-item="" className="text-link mt-6 inline-flex" href={whatsappLink(faq.cta.message)}>
            {faq.cta.label}
          </ExternalLink>
        </Reveal>

        <Reveal from="right" className="lg:col-span-7 lg:col-start-6">
          <div className="faq">
            {faq.items.map((item) => (
              <details key={item.question} data-reveal-item="" className="faq__item">
                <summary className="faq__question">
                  <span className="display">{item.question}</span>
                  <span className="faq__mark" aria-hidden="true" />
                </summary>
                <p className="faq__answer">{item.answer}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
