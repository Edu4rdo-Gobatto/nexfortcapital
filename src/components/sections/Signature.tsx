import { Wordmark } from "@/components/brand/Brand";
import { company, signature, whatsappLink } from "@/content/nexfort";
import { ExternalLink } from "./ExternalLink";
import { Reveal } from "./Reveal";
import { TorreAnchor } from "./TorreAnchor";

/**
 * Assinatura: a Torre fecha a volta de frente sobre o nome, nas proporções do logo original
 * (Torre = 0,2992 da largura do nome; vão de 0,0209). Logo abaixo, o contato numa faixa âmbar: é o convite
 * final, na cor de destaque da marca, com o botão em marinho. O título (esquerda) e os dados (direita) abrem a
 * partir das bordas, em sentidos opostos.
 */
export function Signature() {
  return (
    <>
      <section aria-label={company.name} className="relative px-(--gutter)">
        <div data-torre-section="" className="flex min-h-[84svh] items-center justify-center py-24">
          <div className="lockup">
            <TorreAnchor id="assinatura" face="frente" facing="centro" elev={0} shadow={0} className="lockup__torre" />
            <Wordmark className="lockup__name text-ink" title={company.name} />
            <p className="lockup__areas">{company.areas.join(" | ")}</p>
          </div>
        </div>
      </section>

      <section id="contato" aria-labelledby="contato-titulo" className="layer on-amber bg-amber px-(--gutter) py-20 lg:py-28">
        <div className="mx-auto grid w-full max-w-(--page-max) grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          <Reveal from="left" className="lg:col-span-6">
            <h2 id="contato-titulo" data-reveal-title="" className="display text-[clamp(2.75rem,5.4vw,5rem)]">
              {signature.title}
            </h2>
            <p data-reveal-item="" className="mt-6 max-w-[40ch] text-lg leading-relaxed text-navy">
              {signature.text}
            </p>
            <div data-reveal-item="" className="mt-9">
              <ExternalLink className="button button--navy" href={whatsappLink(signature.cta.message)}>
                {signature.cta.label}
              </ExternalLink>
            </div>
          </Reveal>

          <Reveal from="right" className="lg:col-span-5 lg:col-start-8">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-8 text-navy sm:grid-cols-2">
              <div data-reveal-item="">
                <dt className="eyebrow">Endereço</dt>
                <dd className="mt-2 leading-relaxed">
                  {company.address.street}
                  <br />
                  {company.address.district}, {company.address.city}
                  <br />
                  <ExternalLink className="text-link mt-2 inline-flex" href={company.mapUrl}>
                    {signature.map}
                  </ExternalLink>
                </dd>
              </div>
              <div data-reveal-item="">
                <dt className="eyebrow">Horário</dt>
                <dd className="mt-2 leading-relaxed">{company.hours}</dd>
              </div>
              <div data-reveal-item="">
                <dt className="eyebrow">WhatsApp</dt>
                <dd className="mt-2">
                  <ExternalLink className="text-link" href={whatsappLink(signature.cta.message)}>
                    {company.whatsappDisplay}
                  </ExternalLink>
                </dd>
              </div>
              <div data-reveal-item="">
                <dt className="eyebrow">Instagram</dt>
                <dd className="mt-2">
                  <ExternalLink className="text-link" href={company.instagram.url}>
                    {company.instagram.handle}
                  </ExternalLink>
                </dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </section>
    </>
  );
}
