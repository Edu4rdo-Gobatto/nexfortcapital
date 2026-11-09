/**
 * Todo o texto do site num lugar só.
 *
 * Proposta especulativa: nada aqui foi confirmado pela Nexfort. Cada bloco marca a origem:
 *   - "perfis públicos": dados coletados dos perfis da empresa (MEMORIA_DO_PROJETO.md, seção 5);
 *   - "rascunho da IA": texto escrito para a demonstração, a validar com a Nexfort antes de publicar.
 * Regras: sem promessa de rentabilidade, sem números ou depoimentos inventados.
 */

import type { Face } from "@/components/torre/choreography";

const WHATSAPP_NUMBER = "5566992594858"; // perfis públicos: (66) 99259-4858

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Perfis públicos. */
export const company = {
  name: "Nexfort Capital",
  legalName: "Nexfort Capital Consultoria",
  areas: ["Finanças Empresariais", "Finanças Pessoais", "Investimentos"],
  whatsappDisplay: "(66) 99259-4858", // espaço sem quebra: o número não parte entre o DDD e o resto
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

export type Cta = { label: string; message: string };

/**
 * Onde a Torre fica no bloco e o que mostra. O lado é o da Torre no desktop (o texto fica do outro); a face
 * alterna entre o desenho do logo (frente) e o espelhado (verso), sempre virada para o texto. `hidden`: a Torre
 * sai de cena neste bloco (Sócios) e volta na assinatura; `kind` só escolhe o que ocupa o lugar dela.
 */
export type TorrePlacement = { side: "left" | "right"; face: Face; hidden?: boolean };

type BlockBase = {
  id: string;
  number: string;
  area: string;
  title: string;
  text: string;
  cta: Cta;
  torre: TorrePlacement;
};

/** Lista simples de itens; `note` é um aviso curto sob a lista. */
export type ItemsBlock = BlockBase & { kind: "items"; items: readonly string[]; note?: string };
/** Etapas numeradas: o conteúdo é uma sequência de verdade. */
export type StepsBlock = BlockBase & { kind: "steps"; steps: readonly { verb: string; label: string; text: string }[] };
export type ProgramsBlock = BlockBase & { kind: "programs"; programs: readonly { name: string; mode: string; text: string }[] };
/** Retratos provisórios (iniciais): a Torre sai de cena e o espaço dela é dos sócios. */
export type PartnersBlock = BlockBase & {
  kind: "partners";
  partners: readonly { name: string; initials: string; role: string; bio: string; instagram: { handle: string; url: string } }[];
};
export type Block = ItemsBlock | StepsBlock | ProgramsBlock | PartnersBlock;

/**
 * Blocos imagem/texto, na ordem da página. Áreas, verbos do slogan, nomes dos programas e dos sócios: perfis
 * públicos. Títulos, textos, itens e descrições: rascunho da IA. As Torres alternam de lado e de face.
 */
export const blocks: readonly Block[] = [
  {
    kind: "items",
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
    torre: { side: "left", face: "verso" },
  },
  {
    kind: "items",
    id: "financas-pessoais",
    number: "02",
    area: "Finanças Pessoais",
    title: "Seu dinheiro organizado para a vida que você quer.",
    text: "Mostramos para onde o dinheiro vai, tiramos as dívidas do caminho e criamos uma reserva para o inesperado. O plano se adapta à sua rotina, e não o contrário.",
    items: ["Orçamento que cabe na sua rotina", "Saída das dívidas, com ordem de prioridade", "Reserva de emergência e metas de vida"],
    cta: {
      label: "Conversar sobre as minhas finanças",
      message: "Olá! Vim pelo site e quero conversar sobre as minhas finanças pessoais.",
    },
    torre: { side: "right", face: "frente" },
  },
  {
    // Rascunho da IA. Antes de publicar: confirmar o registro profissional (CVM, ANCORD, CFP) da equipe. Enquanto
    // isso, nada de "recomendação", "gestão" ou promessa de retorno.
    kind: "items",
    id: "investimentos",
    number: "03",
    area: "Investimentos",
    title: "Investimentos ligados ao seu objetivo.",
    text: "Antes de falar em produtos, entendemos o seu perfil e o que você quer conquistar. A partir daí, montamos uma estratégia e acompanhamos junto com você.",
    items: ["Perfil e objetivos", "Estratégia de investimentos", "Acompanhamento e revisão periódica"],
    note: "Todo investimento envolve risco. Não prometemos rentabilidade.",
    cta: {
      label: "Conversar sobre investimentos",
      message: "Olá! Vim pelo site e quero conversar sobre investimentos.",
    },
    torre: { side: "left", face: "verso" },
  },
  {
    // Os três verbos são o slogan real; as descrições são rascunho da IA.
    kind: "steps",
    id: "como-trabalhamos",
    number: "04",
    area: "Como trabalhamos",
    title: "Do diagnóstico ao acompanhamento, em três etapas.",
    text: "Um caminho simples, que serve para a sua casa e para a sua empresa.",
    steps: [
      { verb: "Organize", label: "Diagnóstico", text: "Reunimos receitas, despesas, dívidas e objetivos num retrato claro de onde você está." },
      { verb: "Multiplique", label: "Estratégia", text: "Com o retrato em mãos, definimos prioridades e traçamos o plano para o patrimônio crescer." },
      { verb: "Tenha liberdade", label: "Acompanhamento", text: "Revisamos o plano com você ao longo do tempo, para ele acompanhar a sua vida e o seu negócio." },
    ],
    cta: {
      label: "Começar pelo diagnóstico",
      message: "Olá! Vim pelo site e quero começar pelo diagnóstico financeiro.",
    },
    torre: { side: "right", face: "frente" },
  },
  {
    // Nomes dos programas e a modalidade: perfis públicos. Descrições: rascunho da IA, não confirmadas.
    // "6 edições" (da página antiga da Imersão) não foi confirmado: não usar.
    kind: "programs",
    id: "programas",
    number: "05",
    area: "Programas",
    title: "Para aprender a conduzir as próprias finanças.",
    text: "Dois programas para quem quer ir além da consultoria e aplicar o método no dia a dia.",
    programs: [
      { name: "Imersão Torre Mestra", mode: "Presencial", text: "Uma imersão para colocar as finanças em ordem, com acompanhamento de perto." },
      { name: "Finance Pro", mode: "Avançado", text: "Para quem já tem a base e quer se aprofundar na gestão do próprio patrimônio." },
    ],
    cta: {
      label: "Quero saber dos programas",
      message: "Olá! Vim pelo site e quero saber mais sobre os programas da Nexfort.",
    },
    torre: { side: "left", face: "verso" },
  },
  {
    // Nomes e perfis: públicos. Cargos, biografias e fotos: a confirmar. Nada de foto do Instagram sem autorização:
    // os retratos são provisórios (iniciais).
    kind: "partners",
    id: "socios",
    number: "06",
    area: "Sócios",
    title: "As pessoas por trás da Nexfort.",
    text: "A consultoria é conduzida por Lucas Spinola e Gabriella Valadão.",
    partners: [
      {
        name: "Lucas Spinola",
        initials: "LS",
        role: "Cargo a confirmar",
        bio: "Biografia a confirmar com a Nexfort.",
        instagram: { handle: "@lucasspinolaconsultor", url: "https://www.instagram.com/lucasspinolaconsultor/" },
      },
      {
        name: "Gabriella Valadão",
        initials: "GV",
        role: "Cargo a confirmar",
        bio: "Biografia a confirmar com a Nexfort.",
        instagram: { handle: "@agabriella_valadao", url: "https://www.instagram.com/agabriella_valadao/" },
      },
    ],
    cta: {
      label: "Falar com a equipe",
      message: "Olá! Vim pelo site e gostaria de falar com a equipe da Nexfort.",
    },
    torre: { side: "right", face: "frente", hidden: true },
  },
];

/** Assinatura e contato. Dados: perfis públicos. Frases: rascunho da IA. */
export const signature = {
  title: "Comece por uma conversa.",
  text: "Conte onde você está hoje. A partir daí, desenhamos juntos o próximo passo.",
  cta: {
    label: "Agendar uma conversa", // a mesma ação do cabeçalho e do hero, com as mesmas palavras
    message: "Olá! Vim pelo site da Nexfort Capital e gostaria de agendar uma conversa.",
  },
} as const;

export const footer = {
  note: "Prévia de demonstração. Conteúdo sujeito à validação da Nexfort Capital.",
} as const;
