/**
 * Fonte única de conteúdo da landing page da Nexfort Capital.
 * Textos, contatos e premissas ficam aqui para que as seções não dupliquem dados.
 */

export const BRAND = {
  name: "Nexfort Capital Consultoria",
  shortName: "Nexfort Capital",
  tagline: "Finanças Empresariais | Finanças Pessoais | Investimentos",
  slogan: "Organize, multiplique e tenha liberdade.",
  valueProposition:
    "Empresa especializada em Finanças Empresariais, Finanças Pessoais e Investimentos, mostrando a melhor forma de gerir o seu dinheiro, investir os seus recursos e alavancar os seus negócios.",
  mission:
    "Transformar a cultura financeira de Mato Grosso: empresas organizadas, famílias com reserva e investidores com estratégia.",
} as const;

const WHATSAPP_NUMBER = "5566992594858";

/** Link wa.me com mensagem pré-preenchida (codificada). */
export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_MESSAGES = {
  consultoria: "Olá, vim pelo site da Nexfort Capital e gostaria de agendar uma consultoria.",
  diagnostico: "Olá, vim pelo site da Nexfort Capital e gostaria de agendar um diagnóstico financeiro.",
  simulacao: "Olá, fiz a simulação patrimonial no site da Nexfort Capital e gostaria de conversar com um especialista.",
  itm: "Olá, vim pelo site da Nexfort Capital e quero saber sobre a próxima edição da Imersão Torre Mestra (ITM).",
  financePro: "Olá, vim pelo site da Nexfort Capital e quero conhecer o programa Finance Pro.",
} as const;

export const CONTACT = {
  address: {
    street: "Av. Das Artes, 253",
    district: "Aquarela das Artes",
    city: "Sinop",
    state: "MT",
    postalCode: "78555-474",
    full: "Av. Das Artes, 253 - Aquarela das Artes, Sinop - MT, 78555-474",
    buildingNumber: "253",
  },
  phoneDisplay: "(66) 99259-4858",
  phoneHref: "tel:+5566992594858",
  /** URL oficial fornecida pela empresa (mesma mensagem de WHATSAPP_MESSAGES.consultoria). */
  whatsappUrl:
    "https://wa.me/5566992594858?text=Ol%C3%A1%2C%20vim%20pelo%20site%20da%20Nexfort%20Capital%20e%20gostaria%20de%20agendar%20uma%20consultoria.",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Av.+Das+Artes,+253+-+Aquarela+das+Artes,+Sinop+-+MT,+78555-474",
  instagramUrl: "https://instagram.com/nexfortcapital",
  instagramHandle: "@nexfortcapital",
  googleRating: "5,0",
  googleRatingLabel: "5.0 ★ (Avaliação Máxima no Google)",
  openingHours: "Segunda a Sexta • Abre às 08:00",
  /**
   * Status de atendimento (fuso de Sinop, America/Cuiaba). "Abre seg. às 08:00" só é verdade no fim de semana;
   * sem o horário de fechamento, nos dias úteis exibimos o expediente em vez de "aberto agora".
   */
  openingStatus: {
    timeZone: "America/Cuiaba",
    weekend: "Abre seg. às 08:00",
    beforeOpening: "Abre hoje às 08:00",
    schedule: "Seg. a sex., a partir das 08:00",
  },
} as const;

export const NAV_LINKS = [
  { label: "Finanças Empresariais", href: "#financas-empresariais" },
  { label: "Finanças Pessoais", href: "#financas-pessoais" },
  { label: "Investimentos", href: "#investimentos" },
  { label: "Torre Mestra", href: "#programas" },
  { label: "Sede Sinop", href: "#sede" },
] as const;

/** IDs de âncora das seções (use exatamente estes valores nos atributos id). */
export const SECTION_IDS = {
  hero: "inicio",
  story: "metodo",
  pillars: "pilares",
  simulator: "simulador",
  programs: "programas",
  headquarters: "sede",
} as const;

export const HERO = {
  badge: "CONSULTORIA FINANCEIRA EM SINOP • MT • 5,0 ★ GOOGLE",
  headline: BRAND.slogan,
  subheadline:
    "Mostramos a melhor forma de gerir o seu dinheiro, investir na Bolsa com estratégia e alavancar os seus negócios, com método, indicadores e acompanhamento próximo.",
  primaryCta: "Falar com Especialista no WhatsApp",
  secondaryCta: "Simular Evolução Patrimonial",
} as const;

/** Cards de telemetria ao redor do emblema. Qualitativos de propósito: nada de cotações inventadas. */
export const HERO_TELEMETRY = [
  { code: "IBOV", label: "Renda variável", detail: "Carteira de ações sob estratégia", signal: "up" },
  { code: "CDI", label: "Renda fixa", detail: "Reserva e liquidez", signal: "steady" },
  { code: "B2B", label: "Alavancagem B2B", detail: "Capital de giro estruturado", signal: "up" },
  { code: "PAT", label: "Blindagem Patrimonial", detail: "Holding e proteção", signal: "shield" },
] as const;

export type TelemetrySignal = (typeof HERO_TELEMETRY)[number]["signal"];

/** Gatilhos de modo do RookBullCenterpiece. Métricas descrevem o serviço, não prometem retorno. */
export const CENTERPIECE_MODES = {
  tower: {
    trigger: "Modo Torre",
    title: "Proteção & Gestão",
    metrics: [
      { label: "Fluxo de caixa", value: "Previsível" },
      { label: "DRE gerencial", value: "Mensal" },
      { label: "Reserva estratégica", value: "6–12 meses" },
    ],
  },
  bull: {
    trigger: "Modo Touro",
    title: "Multiplicação & Bolsa",
    metrics: [
      { label: "Carteira", value: "Personalizada" },
      { label: "Classes de ativos", value: "Ações, FIIs, RF" },
      { label: "Rebalanceamento", value: "Periódico" },
    ],
  },
} as const;

export type CenterpieceMode = keyof typeof CENTERPIECE_MODES;

export const TICKER_ITEMS = [
  "Finanças Empresariais",
  "Fluxo de Caixa & Valuation",
  "Finanças Pessoais",
  "Renda Variável & Bolsa de Valores",
  "Imersão Torre Mestra (ITM)",
  "Finance Pro",
  "Sede Própria em Sinop/MT",
] as const;

export const STORY_PHASES = [
  {
    key: "tower",
    symbol: "A Torre",
    title: "A Base Inabalável",
    body: "Antes de multiplicar, organizamos. Estruturamos as finanças pessoais e empresariais, estancamos os ralos financeiros e criamos previsibilidade de caixa.",
    points: [
      "Mapa completo de entradas, saídas e margens",
      "Ralos financeiros identificados e estancados",
      "Caixa previsível, mês a mês",
    ],
  },
  {
    key: "bull",
    symbol: "O Touro",
    title: "A Força da Multiplicação",
    body: "Com a base protegida, o capital excedente é alocado na Bolsa de Valores e em ativos estratégicos para gerar liberdade financeira real.",
    points: [
      "Excedente direcionado com propósito",
      "Bolsa de Valores e ativos estratégicos",
      "Patrimônio trabalhando pela sua liberdade",
    ],
  },
] as const;

export const PILLARS = [
  {
    id: "financas-empresariais",
    title: "Finanças Empresariais",
    summary: "Clareza de números para decidir com segurança e fazer o negócio crescer.",
    items: ["Diagnóstico de margem", "Capital de giro", "DRE gerencial", "Alavancagem de negócios em MT"],
  },
  {
    id: "financas-pessoais",
    title: "Finanças Pessoais",
    summary: "Um padrão de vida sustentável, com orçamento que funciona de verdade.",
    items: ["Reestruturação do padrão de vida", "Orçamento inteligente", "Reservas estratégicas"],
  },
  {
    id: "investimentos",
    title: "Investimentos & Bolsa",
    summary: "Carteira montada para o seu objetivo, prazo e perfil de risco.",
    items: ["Carteira personalizada", "Ações e FIIs", "Renda fixa institucional", "Proteção patrimonial"],
  },
] as const;

export const PROGRAMS = [
  {
    id: "itm",
    name: "Imersão Torre Mestra",
    shortName: "ITM",
    editionsLabel: "1ª à 6ª Edição consolidada",
    editions: 6,
    description:
      "Imersão presencial e estratégica em Finanças e Investimentos para empresários e investidores que buscam domínio patrimonial.",
    highlights: ["Formato presencial e intensivo", "Finanças empresariais e investimentos", "Para empresários e investidores"],
    cta: "Quero a próxima edição",
    whatsappMessage: WHATSAPP_MESSAGES.itm,
  },
  {
    id: "finance-pro",
    name: "Finance Pro",
    shortName: "Finance Pro",
    editionsLabel: "Programa avançado",
    editions: null,
    description:
      "Programa avançado de estruturação, gestão financeira de elite e tomada de decisão baseada em indicadores.",
    highlights: ["Estruturação financeira", "Gestão orientada por indicadores", "Decisões com método"],
    cta: "Conhecer o Finance Pro",
    whatsappMessage: WHATSAPP_MESSAGES.financePro,
  },
] as const;

export const FOUNDERS = [
  {
    name: "Lucas Spinola",
    initials: "LS",
    handle: "@lucasspinolaconsultor",
    instagramUrl: "https://instagram.com/lucasspinolaconsultor",
    role: "Sócio & Consultor Financeiro",
  },
  {
    name: "Gabriella Valadão",
    initials: "GV",
    handle: "@agabriella_valadao",
    instagramUrl: "https://instagram.com/agabriella_valadao",
    role: "Sócia & Especialista em Finanças e Investimentos",
  },
] as const;

/**
 * Premissas do simulador "O Efeito Nexfort". Valores nominais e constantes, sem impostos, taxas ou inflação.
 * Ajuste com a equipe Nexfort antes de publicar; o texto de aviso é obrigatório (sem promessa de retorno).
 */
export const SIMULATOR = {
  savingsAnnualRate: 0.0617,
  savingsLabel: "Gestão Tradicional / Poupança",
  strategyAnnualRate: 0.12,
  strategyLabel: "Metodologia Torre & Touro Nexfort",
  initial: { min: 0, max: 1_000_000, step: 5_000, default: 50_000 },
  monthly: { min: 0, max: 20_000, step: 100, default: 2_000 },
  years: { min: 1, max: 30, step: 1, default: 10 },
  disclaimer:
    "Simulação ilustrativa com taxas efetivas anuais constantes (poupança 6,17% a.a., equivalente a 0,5% a.m., sem TR; cenário Nexfort hipotético de 12% a.a.), sem descontar inflação, custos ou impostos. A poupança é isenta de IR para pessoa física; aplicações tributadas teriam rendimento líquido menor, reduzindo a diferença mostrada. Rentabilidade passada não garante rentabilidade futura. Não constitui promessa de retorno nem recomendação de investimento.",
} as const;
