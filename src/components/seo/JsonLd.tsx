import { BRAND, CONTACT, FOUNDERS } from "@/content/nexfort";

/**
 * Dados estruturados (schema.org) para buscadores. Somente fatos fornecidos pela empresa:
 * sem horário de fechamento nem contagem de avaliações (desconhecidos), para não inventar dados.
 */
const data = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: BRAND.name,
  alternateName: BRAND.shortName,
  slogan: BRAND.slogan,
  description: BRAND.valueProposition,
  telephone: "+55 66 99259-4858",
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT.address.street,
    addressLocality: CONTACT.address.city,
    addressRegion: CONTACT.address.state,
    postalCode: CONTACT.address.postalCode,
    addressCountry: "BR",
  },
  areaServed: { "@type": "State", name: "Mato Grosso" },
  sameAs: [CONTACT.instagramUrl],
  founder: FOUNDERS.map((f) => ({ "@type": "Person", name: f.name, sameAs: f.instagramUrl })),
  knowsAbout: ["Finanças Empresariais", "Finanças Pessoais", "Investimentos", "Bolsa de Valores"],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      // JSON estático do próprio projeto; "<" escapado para não fechar o <script>.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
