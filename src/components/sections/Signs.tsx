import { areas, signs } from "@/content/nexfort";
import { Reveal } from "./Reveal";
import { TorreAnchor } from "./TorreAnchor";

/**
 * "Alguma destas frases é sua?": seis situações do dia a dia, cada uma numa ficha que leva à frente que cuida
 * dela (a cor da ficha é a da frente). É a primeira seção depois do hero: a pessoa se reconhece antes de ler os
 * serviços. Fundo creme, opaco: a Torre sai de cena aqui e volta no primeiro bloco.
 */
export function Signs() {
  const titleId = `${signs.id}-titulo`;
  return (
    <section data-torre-section="" id={signs.id} aria-labelledby={titleId} className="layer bg-cream px-(--gutter) py-24 lg:py-32">
      <TorreAnchor id={signs.id} hidden fill={0.5} className="pointer-events-none !absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-(--page-max) grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-8">
        <Reveal from="left" className="lg:col-span-4">
          <p data-reveal-item="" className="eyebrow">
            {signs.area}
          </p>
          <h2 id={titleId} data-reveal-title="" className="display display-section mt-5">
            {signs.title}
          </h2>
          <p data-reveal-item="" className="mt-7 max-w-[38ch] text-lg leading-relaxed text-ink-soft">
            {signs.lead}
          </p>
        </Reveal>

        <Reveal from="right" className="lg:col-span-7 lg:col-start-6">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {signs.items.map((item) => (
              <li key={item.text} data-reveal-item="">
                <a className="sign-card" data-area={item.area} href={areas[item.area].href}>
                  <span className="display sign-card__text">“{item.text}”</span>
                  <span className="chip">{areas[item.area].label}</span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
