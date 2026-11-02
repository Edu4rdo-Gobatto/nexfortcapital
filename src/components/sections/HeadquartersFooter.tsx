import { ParallaxBox } from "@/components/motion/ParallaxBox";
import { Reveal } from "@/components/motion/Reveal";
import { TextReveal } from "@/components/motion/TextReveal";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";
import { CtaLink } from "@/components/ui/CtaLink";
import { BRAND, CONTACT, SECTION_IDS } from "@/content/nexfort";
import { FacadeIllustration } from "./headquarters/FacadeIllustration";
import { LedRail } from "./headquarters/FacadeMotion";
import { SiteFooter } from "./headquarters/SiteFooter";
import { VisitPlaque } from "./headquarters/VisitPlaque";

const TITLE_ID = `${SECTION_IDS.headquarters}-titulo`;

const COPY = {
  title: "Venha conhecer a nossa sede em Sinop",
  intro: `A sede própria da ${BRAND.shortName} fica no bairro ${CONTACT.address.district}. Lá, a equipe recebe empresários, famílias e investidores para conversar sobre finanças e investimentos.`,
  ctaLead: "Agende sua visita ou tire suas dúvidas antes de vir.",
  cta: "Iniciar conversa no WhatsApp",
} as const;

/**
 * Seção final (sede em Sinop) + rodapé do site.
 * Para landmarks corretos, a página pode usar as partes separadas: <HeadquartersSection /> dentro do <main>
 * e <SiteFooter /> logo depois dele (um <footer> dentro do <main> deixa de ser "contentinfo").
 */
export function HeadquartersFooter() {
  return (
    <>
      <HeadquartersSection />
      <SiteFooter />
    </>
  );
}

/**
 * Fachada noturna em SVG com a fita de LED a 32°, placa de visita e o botão de WhatsApp.
 * Server Component: o movimento fica nas ilhas de cliente (TextReveal, Reveal, ParallaxBox, luzes).
 */
export function HeadquartersSection() {
  return (
    <section
      id={SECTION_IDS.headquarters}
      aria-labelledby={TITLE_ID}
      className="relative isolate overflow-x-clip py-24 sm:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <h2
            id={TITLE_ID}
            className="font-display text-[clamp(2rem,4.2vw,3.5rem)] leading-[1.06] font-semibold tracking-[0.015em] text-balance text-led lg:col-span-7 xl:col-span-8"
          >
            <TextReveal as="span" text={COPY.title} />
          </h2>
          <Reveal
            as="p"
            delay={0.15}
            className="max-w-[62ch] text-base leading-relaxed text-muted sm:text-lg lg:col-span-5 lg:pb-1.5 xl:col-span-4"
          >
            {COPY.intro}
          </Reveal>
        </div>

        <div className="mt-12 grid items-center gap-12 sm:mt-16 lg:grid-cols-12 lg:gap-8">
          {/* A fachada desliza um pouco mais devagar que a placa: profundidade sutil. */}
          <ParallaxBox speed={0.05} className="pointer-events-none -mx-5 sm:mx-0 lg:col-span-7 xl:col-span-8">
            <FacadeIllustration />
          </ParallaxBox>
          <Reveal delay={0.1} className="lg:col-span-5 xl:col-span-4">
            <VisitPlaque />
          </Reveal>
        </div>

        <div className="mt-16 flex flex-col items-center gap-8 text-center sm:mt-24">
          <Reveal
            as="p"
            className="max-w-[40ch] font-display text-xl leading-snug tracking-[0.03em] text-balance text-led sm:text-2xl"
          >
            {COPY.ctaLead}
          </Reveal>
          <div className="flex w-full items-center justify-center gap-6 lg:gap-10">
            <LedRail side="left" className="hidden min-w-8 flex-1 sm:block" />
            <CtaLink
              variant="gold"
              size="xl"
              href={CONTACT.whatsappUrl}
              external
              className="w-full px-4 sm:w-auto sm:px-12 lg:h-24 lg:gap-4 lg:px-16 lg:text-2xl lg:[--cut:28px]"
            >
              <WhatsAppIcon className="size-6 shrink-0 sm:size-7 lg:size-8" />
              {COPY.cta}
            </CtaLink>
            <LedRail side="right" className="hidden min-w-8 flex-1 sm:block" />
          </div>
        </div>
      </div>
    </section>
  );
}

export { SiteFooter };
