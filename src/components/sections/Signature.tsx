import { Wordmark } from "@/components/brand/Brand";
import { company, signature, whatsappLink } from "@/content/nexfort";
import { Reveal } from "./Reveal";
import { TorreAnchor } from "./TorreAnchor";

/**
 * Assinatura: a Torre fecha a volta de frente sobre o nome, nas proporções do logo original
 * (Torre = 0,2992 da largura do nome; vão de 0,0209), e o contato completa o bloco.
 */
export function Signature() {
  return (
    <section id="contato" aria-labelledby="contato-titulo" className="relative px-(--gutter) pb-16">
      <div data-torre-section="" className="flex min-h-[84svh] items-center justify-center py-24">
        <div className="lockup">
          <TorreAnchor id="assinatura" elev={0} shadow={0} className="lockup__torre" />
          <Wordmark className="lockup__name text-ink" title={company.name} />
          <p className="lockup__areas">{company.areas.join(" | ")}</p>
        </div>
      </div>

      <Reveal className="mx-auto grid w-full max-w-(--page-max) grid-cols-1 gap-y-12 border-t border-line pt-16 lg:grid-cols-12 lg:gap-x-8">
        <div className="lg:col-span-6">
          <h2 id="contato-titulo" data-reveal-title="" className="display text-[clamp(2.25rem,3.6vw,3.75rem)]">
            {signature.title}
          </h2>
          <p data-reveal-item="" className="mt-6 max-w-[40ch] text-lg leading-relaxed text-ink-soft">
            {signature.text}
          </p>
          <div data-reveal-item="" className="mt-9">
            <a className="button" href={whatsappLink(signature.cta.message)} target="_blank" rel="noopener noreferrer">
              {signature.cta.label}
            </a>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 lg:col-span-5 lg:col-start-8">
          <div data-reveal-item="">
            <dt className="eyebrow">Endereço</dt>
            <dd className="mt-2 leading-relaxed">
              {company.address.street}
              <br />
              {company.address.district}, {company.address.city}
            </dd>
          </div>
          <div data-reveal-item="">
            <dt className="eyebrow">Horário</dt>
            <dd className="mt-2 leading-relaxed">{company.hours}</dd>
          </div>
          <div data-reveal-item="">
            <dt className="eyebrow">WhatsApp</dt>
            <dd className="mt-2">
              <a className="text-link" href={whatsappLink(signature.cta.message)} target="_blank" rel="noopener noreferrer">
                {company.whatsappDisplay}
              </a>
            </dd>
          </div>
          <div data-reveal-item="">
            <dt className="eyebrow">Instagram</dt>
            <dd className="mt-2">
              <a className="text-link" href={company.instagram.url} target="_blank" rel="noopener noreferrer">
                {company.instagram.handle}
              </a>
            </dd>
          </div>
        </dl>
      </Reveal>
    </section>
  );
}
