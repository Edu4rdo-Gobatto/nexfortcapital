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

/** Começo do link do WhatsApp: quem monta a mensagem no navegador (o diagnóstico) só acrescenta o texto codificado. */
export const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}?text=`;

export function whatsappLink(message: string) {
  return `${WHATSAPP_BASE}${encodeURIComponent(message)}`;
}

/** Perfis públicos. */
export const company = {
  name: "Nexfort Capital",
  legalName: "Nexfort Capital Consultoria",
  areas: ["Finanças Empresariais", "Finanças Pessoais", "Investimentos"],
  whatsappDisplay: "(66) 99259-4858", // espaço sem quebra: o número não parte entre o DDD e o resto
  instagram: { handle: "@nexfortcapital", url: "https://www.instagram.com/nexfortcapital/" },
  address: { street: "Av. das Artes, 253", district: "Aquarela das Artes", city: "Sinop, MT", zip: "78555-474" },
  /** busca do endereço no Google Maps (só um link: nenhum mapa é carregado na página) */
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Av.+das+Artes%2C+253+-+Aquarela+das+Artes%2C+Sinop+-+MT",
  hours: "Segunda a sexta, a partir das 8h",
} as const;

/**
 * As três frentes e as três cores quentes do logo (o degradê do urso e do touro: âmbar, laranja, vermelho).
 * Cada frente leva uma cor, sempre a mesma: no nicho atrás da Torre, no filete das listas e nas etiquetas.
 * A escolha de qual cor vai com qual frente é da IA (a ordem do logo: de cima para baixo).
 */
export type AreaKey = "empresa" | "pessoal" | "investimentos";
export const areas: Record<AreaKey, { label: string; href: string }> = {
  empresa: { label: "Finanças Empresariais", href: "#financas-empresariais" },
  pessoal: { label: "Finanças Pessoais", href: "#financas-pessoais" },
  investimentos: { label: "Investimentos", href: "#investimentos" },
};

/** Navegação do cabeçalho (só em tela larga): os mesmos nomes das seções. */
export const nav = [
  { label: "Serviços", href: "#financas-empresariais" },
  { label: "Método", href: "#como-trabalhamos" },
  { label: "Diagnóstico", href: "#diagnostico" },
  { label: "Programas", href: "#programas" },
  { label: "Sócios", href: "#socios" },
  { label: "Dúvidas", href: "#duvidas" },
] as const;

/** Hero. Slogan e frentes: perfis públicos. Texto de apoio: rascunho da IA. */
export const hero = {
  eyebrow: "Consultoria financeira em Sinop, MT",
  titleLines: ["Organize,", "multiplique e", "tenha liberdade."],
  lead: "Colocamos em ordem as finanças da sua empresa e da sua casa, e ligamos os investimentos ao que você quer conquistar.",
  cta: {
    label: "Agendar uma conversa",
    message: "Olá! Vim pelo site da Nexfort Capital e gostaria de agendar uma conversa.",
  },
  /** segundo caminho: quem ainda não quer conversar descobre a etapa em que está */
  secondary: { label: "Descobrir a minha etapa em 1 minuto", href: "#diagnostico" },
  /** as três frentes, como índice no pé da primeira tela */
  index: ["empresa", "pessoal", "investimentos"] as readonly AreaKey[],
} as const;

/** Faixa de palavras entre o hero e o resto: os três verbos do slogan (perfis públicos), em letras grandes. */
export const band = { words: ["Organize", "Multiplique", "Tenha liberdade"] } as const;

/**
 * "Alguma destas frases é sua?": situações do dia a dia, na voz de quem procura ajuda, cada uma ligada à frente
 * que cuida dela. Rascunho da IA: são situações genéricas de finanças, não relatos de clientes.
 */
export const signs = {
  id: "sinais",
  area: "Por onde começar",
  title: "Alguma destas frases é sua?",
  lead: "São situações em que uma consultoria financeira ajuda. Cada uma tem um ponto de partida: toque na sua para ver qual.",
  items: [
    { area: "empresa", text: "Vendo bem, mas o caixa vive apertado." },
    { area: "empresa", text: "A conta da empresa e a minha se misturam." },
    { area: "pessoal", text: "O salário acaba antes do mês." },
    { area: "pessoal", text: "Pago uma dívida fazendo outra." },
    { area: "investimentos", text: "Sobra dinheiro, mas ele fica parado na conta." },
    { area: "investimentos", text: "Invisto, mas não sei se faz sentido para mim." },
  ] as readonly { area: AreaKey; text: string }[],
} as const;

export type Cta = { label: string; message: string };

/** Cor do nicho atrás da Torre: uma das três frentes, o lilás neutro ou nenhum. */
export type NicheTone = AreaKey | "sun" | "lilac";

/**
 * Onde a Torre fica no bloco e o que mostra. O lado é o da Torre no desktop (o texto fica do outro); a face
 * alterna entre o desenho do logo (frente) e o espelhado (verso), sempre virada para o texto. `hidden`: a Torre
 * sai de cena neste bloco (Sócios) e volta na assinatura; `kind` só escolhe o que ocupa o lugar dela.
 */
export type TorrePlacement = { side: "left" | "right"; face: Face; hidden?: boolean; niche?: NicheTone };

/** As três partes da Torre, de baixo para cima: são as três etapas do método. */
export type TorrePart = "base" | "body" | "crown";

type BlockBase = {
  id: string;
  area: string;
  title: string;
  text: string;
  cta: Cta;
  torre: TorrePlacement;
  /** a frente a que o bloco pertence: dá a cor do filete da lista */
  accent?: AreaKey;
};

/** Lista de itens, cada um com uma linha de explicação; `note` é um aviso curto sob a lista. */
export type ItemsBlock = BlockBase & { kind: "items"; items: readonly { title: string; text: string }[]; note?: string };
/**
 * O método: a Torre se desmonta em base, corpo e coroa, e cada parte é uma etapa (os três verbos do slogan).
 * A numeração aqui é informação: é uma sequência de verdade.
 */
export type StepsBlock = BlockBase & {
  kind: "steps";
  steps: readonly { part: TorrePart; partName: string; verb: string; label: string; text: string }[];
};
export type ProgramsBlock = BlockBase & {
  kind: "programs";
  programs: readonly { name: string; mode: string; text: string; audience: string }[];
};
/** Retratos provisórios (iniciais): a Torre sai de cena e o espaço dela é dos sócios. Cargo e biografia só aparecem quando existem. */
export type PartnersBlock = BlockBase & {
  kind: "partners";
  partners: readonly { name: string; initials: string; role?: string; bio?: string; instagram: { handle: string; url: string } }[];
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
    area: "Finanças Empresariais",
    accent: "empresa",
    title: "Clareza para decidir o futuro da sua empresa.",
    text: "Organizamos os números do negócio para que cada decisão, de investir a contratar, parta do que o caixa realmente mostra.",
    items: [
      { title: "Fluxo de caixa e capital de giro", text: "Quanto entra, quanto sai e quanto precisa ficar no caixa." },
      { title: "Custos, margem e formação de preço", text: "Preço calculado, com a margem de que o negócio precisa." },
      { title: "Planejamento e indicadores de gestão", text: "Metas claras e poucos números para acompanhar todo mês." },
    ],
    cta: {
      label: "Conversar sobre a minha empresa",
      message: "Olá! Vim pelo site e quero conversar sobre as finanças da minha empresa.",
    },
    torre: { side: "left", face: "verso", niche: "empresa" },
  },
  {
    kind: "items",
    id: "financas-pessoais",
    area: "Finanças Pessoais",
    accent: "pessoal",
    title: "Seu dinheiro organizado para a vida que você quer.",
    text: "Mostramos para onde o dinheiro vai, tiramos as dívidas do caminho e criamos uma reserva para o inesperado. O plano se adapta à sua rotina, e não o contrário.",
    items: [
      { title: "Orçamento que cabe na sua rotina", text: "Um plano de gastos simples de manter no dia a dia." },
      { title: "Saída das dívidas", text: "Ordem de prioridade para quitar sem sufoco." },
      { title: "Reserva de emergência e metas de vida", text: "Proteção para imprevistos e um caminho para cada objetivo." },
    ],
    cta: {
      label: "Conversar sobre as minhas finanças",
      message: "Olá! Vim pelo site e quero conversar sobre as minhas finanças pessoais.",
    },
    torre: { side: "right", face: "frente", niche: "pessoal" },
  },
  {
    // Rascunho da IA. Antes de publicar: confirmar o registro profissional (CVM, ANCORD, CFP) da equipe. Enquanto
    // isso, nada de "recomendação", "gestão" ou promessa de retorno.
    kind: "items",
    id: "investimentos",
    area: "Investimentos",
    accent: "investimentos",
    title: "Investimentos ligados ao seu objetivo.",
    text: "Antes de falar em produtos, entendemos o seu perfil e o que você quer conquistar. A partir daí, montamos uma estratégia e acompanhamos junto com você.",
    items: [
      { title: "Perfil e objetivos", text: "O que você quer conquistar, em quanto tempo e com quanto risco." },
      { title: "Estratégia de investimentos", text: "Um caminho coerente com o seu perfil e os seus prazos." },
      { title: "Acompanhamento e revisão periódica", text: "Ajustes ao longo do tempo, para o plano seguir a sua vida." },
    ],
    note: "Todo investimento envolve risco. Não prometemos rentabilidade.",
    cta: {
      label: "Conversar sobre investimentos",
      message: "Olá! Vim pelo site e quero conversar sobre investimentos.",
    },
    torre: { side: "left", face: "verso", niche: "investimentos" },
  },
  {
    // Os três verbos são o slogan real. A leitura "a Torre é o método" (base, corpo, coroa) e as descrições são
    // rascunho da IA: a Nexfort já usa a Torre como metáfora (Imersão Torre Mestra), mas não confirmou esta.
    kind: "steps",
    id: "como-trabalhamos",
    area: "O método",
    title: "Uma torre se ergue de baixo para cima. O seu patrimônio também.",
    text: "A Torre da Nexfort tem três partes, e cada uma é uma etapa do trabalho. Nenhuma se sustenta sem a anterior.",
    steps: [
      {
        part: "base",
        partName: "A base",
        verb: "Organize",
        label: "Diagnóstico",
        text: "Reunimos receitas, despesas, dívidas e objetivos num retrato claro de onde você está.",
      },
      {
        part: "body",
        partName: "O corpo",
        verb: "Multiplique",
        label: "Estratégia",
        text: "Com o retrato em mãos, definimos prioridades e traçamos o plano para o patrimônio crescer.",
      },
      {
        part: "crown",
        partName: "A coroa",
        verb: "Tenha liberdade",
        label: "Acompanhamento",
        text: "Revisamos o plano com você ao longo do tempo, para ele acompanhar a sua vida e o seu negócio.",
      },
    ],
    cta: {
      label: "Começar pela base",
      message: "Olá! Vim pelo site e quero começar pelo diagnóstico financeiro.",
    },
    torre: { side: "right", face: "frente" },
  },
  {
    // Nomes dos programas e a modalidade: perfis públicos. Descrições e "para quem": rascunho da IA, não
    // confirmados. "6 edições" (da página antiga da Imersão) não foi confirmado: não usar.
    kind: "programs",
    id: "programas",
    area: "Programas",
    title: "Para aprender a conduzir as próprias finanças.",
    text: "Dois programas para quem quer ir além da consultoria e aplicar o método no dia a dia.",
    programs: [
      {
        name: "Imersão Torre Mestra",
        mode: "Presencial",
        text: "Uma imersão para colocar as finanças em ordem, com acompanhamento de perto.",
        audience: "Para quem quer sair com as contas organizadas e um plano na mão.",
      },
      {
        name: "Finance Pro",
        mode: "Avançado",
        text: "Um programa para se aprofundar na gestão do próprio patrimônio.",
        audience: "Para quem já tem a base e quer decidir sozinho, com método.",
      },
    ],
    cta: {
      label: "Quero saber dos programas",
      message: "Olá! Vim pelo site e quero saber mais sobre os programas da Nexfort.",
    },
    torre: { side: "left", face: "verso", niche: "lilac" },
  },
  {
    // Nomes e perfis: públicos. Cargos, biografias e fotos entram com o material da Nexfort (campos `role` e `bio`):
    // enquanto não existem, não aparecem. Nada de foto do Instagram sem autorização: os retratos são iniciais.
    kind: "partners",
    id: "socios",
    area: "Sócios",
    title: "As pessoas por trás da Nexfort.",
    text: "A consultoria é conduzida por Lucas Spinola e Gabriella Valadão. Quem atende você é quem responde pelo plano.",
    partners: [
      {
        name: "Lucas Spinola",
        initials: "LS",
        instagram: { handle: "@lucasspinolaconsultor", url: "https://www.instagram.com/lucasspinolaconsultor/" },
      },
      {
        name: "Gabriella Valadão",
        initials: "GV",
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

/** Seções que entram entre os blocos, depois do bloco com este id. */
export const DIAGNOSTIC_AFTER = "como-trabalhamos";
export const FAQ_AFTER = "socios";

/**
 * Diagnóstico de 1 minuto: cinco perguntas que situam a pessoa numa das três etapas do método e levam as
 * respostas para o WhatsApp, já no contexto certo. Rascunho da IA, do começo ao fim.
 *
 * Não é avaliação financeira e não recomenda nada: só diz por onde a conversa começa. O site não guarda as
 * respostas (não há servidor nem cookie): elas vão apenas na mensagem que a pessoa decide enviar.
 *
 * Regra do resultado: `base` soma as perguntas da base (0 a 4) e `body` as do corpo (0 a 4). Menos de 3 na
 * base: etapa Organize. Base firme e menos de 4 no corpo: Multiplique. Tudo no máximo: Tenha liberdade.
 */
export type DiagnosticQuestion = {
  /** nome curto, usado na mensagem do WhatsApp */
  short: string;
  text: string;
  /** a que parte da Torre a pergunta pertence; sem valor: só contexto (não pontua) */
  part?: "base" | "body";
  options: readonly { label: string; score: number }[];
};

export type DiagnosticResult = { verb: string; partName: string; text: string; next: string };

export const diagnostic = {
  id: "diagnostico",
  area: "Diagnóstico de 1 minuto",
  title: "Em que etapa você está?",
  lead: "Cinco perguntas mostram por onde a sua conversa com a Nexfort deve começar: pela base, pelo corpo ou pela coroa.",
  privacy: "O site não guarda as suas respostas. Elas seguem só na mensagem que você decidir enviar.",
  questions: [
    {
      short: "Assunto",
      text: "Sobre o que é a conversa?",
      options: [
        { label: "A minha empresa", score: 0 },
        { label: "As minhas finanças pessoais", score: 0 },
        { label: "As duas coisas", score: 0 },
      ],
    },
    {
      short: "Entradas e saídas",
      text: "Você sabe quanto entra e quanto sai por mês?",
      part: "base",
      options: [
        { label: "Não acompanho", score: 0 },
        { label: "Sei de cabeça, mais ou menos", score: 1 },
        { label: "Sim, registrado e conferido", score: 2 },
      ],
    },
    {
      short: "Dívidas",
      text: "Como estão as dívidas hoje?",
      part: "base",
      options: [
        { label: "Pesam no mês", score: 0 },
        { label: "Existem, mas estão sob controle", score: 1 },
        { label: "Não tenho dívidas", score: 2 },
      ],
    },
    {
      short: "Reserva",
      text: "Existe uma reserva para imprevistos?",
      part: "body",
      options: [
        { label: "Ainda não", score: 0 },
        { label: "Comecei a formar", score: 1 },
        { label: "Sim, cobre alguns meses", score: 2 },
      ],
    },
    {
      short: "O que sobra",
      text: "O que acontece com o dinheiro que sobra?",
      part: "body",
      options: [
        { label: "Não costuma sobrar", score: 0 },
        { label: "Fica parado na conta", score: 1 },
        { label: "É investido com um objetivo", score: 2 },
      ],
    },
  ] satisfies DiagnosticQuestion[],
  results: {
    base: {
      verb: "Organize",
      partName: "a base da Torre",
      text: "Antes de crescer, é preciso enxergar: o que entra, o que sai e o que pesa. É a base que sustenta todo o resto.",
      next: "A primeira conversa começa por um retrato das suas receitas, despesas e dívidas.",
    },
    body: {
      verb: "Multiplique",
      partName: "o corpo da Torre",
      text: "A base está de pé. Agora é dar destino ao que sobra: formar a reserva e fazer o patrimônio crescer com um plano.",
      next: "A primeira conversa começa pelas suas prioridades e pelo plano para chegar nelas.",
    },
    crown: {
      verb: "Tenha liberdade",
      partName: "a coroa da Torre",
      text: "Você já organiza e já dá destino ao dinheiro. O passo seguinte é proteger o que construiu e manter o plano em dia.",
      next: "A primeira conversa começa pelos seus objetivos e pela revisão do que você já tem.",
    },
  } satisfies Record<TorrePart, DiagnosticResult>,
  ui: {
    progress: "Pergunta {n} de {total}",
    back: "Voltar",
    resultLabel: "A sua etapa hoje",
    send: "Enviar as respostas pelo WhatsApp",
    restart: "Refazer o diagnóstico",
    disclaimer: "É um ponto de partida para a conversa, não uma avaliação financeira.",
  },
  message: {
    opening: "Olá! Fiz o diagnóstico no site da Nexfort Capital.",
    stage: "Etapa",
    closing: "Gostaria de agendar uma conversa.",
  },
} as const;

/**
 * Perguntas frequentes. Rascunho da IA: as respostas só afirmam o que já está no site (três frentes, dois
 * programas, endereço e horário dos perfis públicos, a regra de não prometer retorno). A Nexfort precisa
 * validar cada uma antes de publicar.
 */
export const faq = {
  id: "duvidas",
  area: "Dúvidas",
  title: "Perguntas frequentes.",
  lead: "Não achou a sua? Mande pelo WhatsApp.",
  cta: {
    label: "Perguntar pelo WhatsApp",
    message: "Olá! Vim pelo site da Nexfort Capital e tenho uma dúvida.",
  },
  items: [
    {
      question: "Como funciona a primeira conversa?",
      answer: "Serve para entender o seu momento e o que você procura. A partir dela, indicamos por onde começar: pela empresa, pelas finanças pessoais ou pelos investimentos.",
    },
    {
      question: "A consultoria é para empresa ou para pessoa física?",
      answer: "Para as duas. São três frentes: finanças empresariais, finanças pessoais e investimentos. Quando os assuntos se cruzam, o plano considera os dois lados.",
    },
    {
      question: "Preciso já ter dinheiro investido?",
      answer: "Não. O trabalho começa pela organização: saber o que entra, o que sai e o que pesa. Investir vem depois da base.",
    },
    {
      question: "Vocês prometem rentabilidade?",
      answer: "Não. Todo investimento envolve risco. O que oferecemos é método: entender o seu perfil, definir uma estratégia e acompanhar.",
    },
    {
      question: "Qual a diferença entre a consultoria e os programas?",
      answer: "Na consultoria, o plano é feito para você. Nos programas (Imersão Torre Mestra e Finance Pro), você aprende o método para conduzir as próprias finanças.",
    },
    {
      question: "Onde fica o escritório?",
      answer: "Na Av. das Artes, 253, Aquarela das Artes, em Sinop, MT. O atendimento é de segunda a sexta, a partir das 8h. Combine o horário pelo WhatsApp.",
    },
  ],
} as const;

/** Assinatura e contato. Dados: perfis públicos. Frases: rascunho da IA. */
export const signature = {
  title: "Comece por uma conversa.",
  text: "Conte onde você está hoje. A partir daí, desenhamos juntos o próximo passo.",
  cta: {
    label: "Agendar uma conversa", // a mesma ação do cabeçalho e do hero, com as mesmas palavras
    message: "Olá! Vim pelo site da Nexfort Capital e gostaria de agendar uma conversa.",
  },
  map: "Ver no mapa",
} as const;

export const footer = {
  about: "Consultoria em finanças empresariais, finanças pessoais e investimentos, em Sinop, MT.",
  columns: { services: "Serviços", company: "Nexfort", contact: "Contato" },
  risk: "Todo investimento envolve risco. A Nexfort não promete rentabilidade.",
  note: "Prévia de demonstração. Conteúdo sujeito à validação da Nexfort Capital.",
} as const;
