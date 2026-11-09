/**
 * Todo o texto do site num lugar só.
 *
 * Proposta especulativa: nada aqui foi confirmado pela Nexfort. Cada bloco marca a origem:
 *   - "perfis públicos": dados coletados dos perfis da empresa (MEMORIA_DO_PROJETO.md, seção 5);
 *   - "rascunho da IA": texto escrito para a demonstração, a validar com a Nexfort antes de publicar.
 * Regras: sem promessa de rentabilidade, sem números ou depoimentos inventados.
 */

const WHATSAPP_NUMBER = "5566992594858"; // perfis públicos: (66) 99259-4858

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Perfis públicos. */
export const company = {
  name: "Nexfort Capital",
  legalName: "Nexfort Capital Consultoria",
  areas: ["Finanças Empresariais", "Finanças Pessoais", "Investimentos"],
  whatsappDisplay: "(66) 99259-4858",
  instagram: { handle: "@nexfortcapital", url: "https://www.instagram.com/nexfortcapital/" },
  address: { street: "Av. das Artes, 253", district: "Aquarela das Artes", city: "Sinop, MT", zip: "78555-474" },
  hours: "Segunda a sexta, a partir das 8h",
} as const;

/** Hero. Slogan e frentes: perfis públicos. */
export const hero = {
  eyebrow: "Consultoria financeira · Sinop, MT",
  titleLines: ["Organize,", "multiplique e", "tenha liberdade."],
  lead: "Consultoria em finanças empresariais, finanças pessoais e investimentos.",
  cta: {
    label: "Agendar uma conversa",
    message: "Olá! Vim pelo site da Nexfort Capital e gostaria de agendar uma conversa.",
  },
} as const;

export type Block = {
  id: string;
  number: string;
  area: string;
  title: string;
  text: string;
  items: readonly string[];
  cta: { label: string; message: string };
  /** Lado da Torre no desktop. Os blocos alternam; o hero tem a Torre à direita. */
  torreSide: "left" | "right";
};

/** Blocos imagem/texto. Áreas: perfis públicos. Títulos, textos e itens: rascunho da IA. */
export const blocks: readonly Block[] = [
  {
    id: "financas-empresariais",
    number: "01",
    area: "Finanças Empresariais",
    title: "Clareza para decidir o futuro da sua empresa.",
    text: "Organizamos os números do negócio para que cada decisão, de investir a contratar, parta do que o caixa realmente mostra.",
    items: ["Fluxo de caixa e capital de giro", "Custos, margem e formação de preço", "Planejamento e indicadores de gestão"],
    cta: {
      label: "Conversar sobre a minha empresa",
      message: "Olá! Vim pelo site e quero conversar sobre as finanças da minha empresa.",
    },
    torreSide: "left",
  },
];

/** Assinatura e contato. Dados: perfis públicos. Frases: rascunho da IA. */
export const signature = {
  title: "Comece por uma conversa.",
  text: "Conte onde você está hoje. A partir daí, desenhamos juntos o próximo passo.",
  cta: {
    label: "Agendar pelo WhatsApp",
    message: "Olá! Vim pelo site da Nexfort Capital e gostaria de agendar uma conversa.",
  },
} as const;

export const footer = {
  note: "Prévia de demonstração. Conteúdo sujeito à validação da Nexfort Capital.",
} as const;
