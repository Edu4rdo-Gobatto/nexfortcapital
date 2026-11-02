import { useId } from "react";
import { EMBLEM_HEIGHT, EMBLEM_WIDTH } from "@/components/brand/geometry";
import { EMBLEM_SRC } from "@/components/brand/NexfortLogo";
import { BRAND, CONTACT } from "@/content/nexfort";
import { cn } from "@/lib/utils";
import { FacadeStage, LedLine, LightFade } from "./FacadeMotion";

/** A logo original ocupa a mesma caixa do emblema (viewBox 160×240 do EMBLEM_TRANSFORM), apoiada na base. */
const EMBLEM_IMAGE = {
  x: 0,
  y: 0,
  width: EMBLEM_WIDTH,
  height: EMBLEM_HEIGHT,
  preserveAspectRatio: "xMidYMax meet",
} as const;
import {
  BUILDING,
  BUILDING_NUMBER,
  BUILDING_PATH,
  CURB_Y,
  DESK,
  DOOR_FRAME_PATH,
  DOOR_HANDLES_PATH,
  DOWNLIGHTS,
  downlightPath,
  EMBLEM_TRANSFORM,
  FACADE_HEIGHT,
  FACADE_VIEWBOX,
  FACADE_WIDTH,
  FLOOR_Y,
  GLASS_END_X,
  GLASS_PATH,
  GLASS_STREAKS,
  GROUND_Y,
  LAWN_Y,
  LED_END_X,
  LED_PATH,
  LED_Y,
  LOBBY_LIGHT_X,
  MEZZANINE,
  MULLION_SHEEN_PATH,
  MULLIONS_PATH,
  PANEL,
  PAVING_JOINTS_PATH,
  PORTICO_LEFT,
  RAIL_GLOW_RANGE,
  RAIL_LOW_PATH,
  RAIL_POSTS_PATH,
  RAIL_TOP_PATH,
  RAMP_EDGE_PATH,
  RAMP_SIDE_PATH,
  RED_STRIPE,
  SIGN,
  STEP_RISE,
  STEPS,
  TIE_HOLES,
  TRANSOMS_PATH,
} from "./facade-geometry";

const INK = "#060913";
const WARM_LIGHT = "#FFE8C4";

/** Atributos comuns do "253" (texto real em JetBrains Mono, largura travada para não depender da fonte). */
const NUMBER_TEXT = {
  x: BUILDING_NUMBER.right,
  y: BUILDING_NUMBER.baseline,
  textAnchor: "end",
  fontSize: BUILDING_NUMBER.size,
  fontWeight: 500,
  textLength: BUILDING_NUMBER.width,
  lengthAdjust: "spacing",
  className: "font-mono",
} as const;

const WORDMARK_TEXT = {
  x: SIGN.cx,
  y: SIGN.wordmarkY,
  textAnchor: "middle",
  fontSize: 34,
  fontWeight: 600,
  textLength: SIGN.width,
  lengthAdjust: "spacing",
  className: "font-display",
} as const;

type FacadeIllustrationProps = {
  className?: string;
};

/**
 * Fachada noturna da sede (Av. Das Artes, 253): monólito de concreto grafite, pórtico de vidro duplo
 * com montantes de aço e a fita de LED branco-quente que corre no topo do vidro e desce a 32° até a rampa.
 * Decorativa (aria-hidden). Só as camadas de luz são ilhas de cliente; o resto é SVG estático do servidor.
 */
export function FacadeIllustration({ className }: FacadeIllustrationProps) {
  // IDs únicos por instância: rotas ocultas mantidas no DOM (cacheComponents) não podem colidir.
  const uid = `hq-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const defId = (name: string) => `${uid}-${name}`;
  const paint = (name: string) => `url(#${defId(name)})`;
  const wordmark = BRAND.shortName.toUpperCase();
  const tagline = BRAND.tagline.toUpperCase();
  const number = CONTACT.address.buildingNumber;

  return (
    // Celular: 1:1 com recorte ancorado à direita (x 300 → 1200), fachada ~33% maior. A partir de sm: 4:3 inteira.
    <FacadeStage className={cn("relative aspect-square w-full select-none sm:aspect-4/3", className)}>
      <svg
        viewBox={FACADE_VIEWBOX}
        preserveAspectRatio="xMaxYMid slice"
        className="absolute inset-0 size-full"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient id={defId("sky")}>
            <stop offset="0" stopColor="#1E2D6B" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#0F1738" stopOpacity="0.3" />
            <stop offset="1" stopColor={INK} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={defId("concrete")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2A303D" />
            <stop offset="0.55" stopColor="#222734" />
            <stop offset="1" stopColor="#1A1F2B" />
          </linearGradient>
          <linearGradient id={defId("mass")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.04" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.3" />
          </linearGradient>
          {/* Noite: o topo do volume se apaga; quem desenha a fachada são a fita e o letreiro. */}
          <linearGradient id={defId("night")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="0.6" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <pattern
            id={defId("panels")}
            width={PANEL.width}
            height={PANEL.height}
            x={BUILDING.left}
            y={BUILDING.top}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M0 0.6H${PANEL.width}M0.6 0V${PANEL.height}`}
              fill="none"
              stroke="#0A0D14"
              strokeOpacity="0.6"
              strokeWidth="1.2"
            />
            {TIE_HOLES.map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.9" fill="#090C12" fillOpacity="0.6" />
            ))}
          </pattern>
          <linearGradient id={defId("interior")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0A1023" />
            <stop offset="0.55" stopColor="#0F172E" />
            <stop offset="1" stopColor="#1B2338" />
          </linearGradient>
          <linearGradient id={defId("tint")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3B55C4" stopOpacity="0.14" />
            <stop offset="1" stopColor="#0F1738" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={defId("streak")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.07" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={defId("cone")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFE2B8" stopOpacity="0.2" />
            <stop offset="1" stopColor="#FFE2B8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={defId("pillarShadow")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000000" stopOpacity="0.5" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={defId("signWash")}>
            <stop offset="0" stopColor="#F8FAFC" stopOpacity="0.12" />
            <stop offset="1" stopColor="#F8FAFC" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={defId("numeral")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#CBD3DE" />
          </linearGradient>
          <linearGradient
            id={defId("railGlow")}
            gradientUnits="userSpaceOnUse"
            x1={RAIL_GLOW_RANGE.from}
            y1="0"
            x2={RAIL_GLOW_RANGE.to}
            y2="0"
          >
            <stop offset="0.6" stopColor="#FFE2B0" stopOpacity="0" />
            <stop offset="0.8" stopColor="#FFE2B0" stopOpacity="0.95" />
            <stop offset="0.96" stopColor="#FFE2B0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={defId("paving")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1F232D" />
            <stop offset="1" stopColor="#12151C" />
          </linearGradient>
          <linearGradient id={defId("lawn")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#101C14" />
            <stop offset="1" stopColor="#070B09" />
          </linearGradient>
          <pattern id={defId("grass")} width="16" height="8" patternUnits="userSpaceOnUse">
            <path d="M2 8V4.5M6 8V5.5M9.5 8V3.8M13 8V5" stroke="#1F3326" strokeWidth="1" />
          </pattern>
          <radialGradient id={defId("pool")}>
            <stop offset="0" stopColor={WARM_LIGHT} stopOpacity="0.5" />
            <stop offset="1" stopColor={WARM_LIGHT} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={defId("lobbyPool")}>
            <stop offset="0" stopColor={WARM_LIGHT} stopOpacity="0.14" />
            <stop offset="1" stopColor={WARM_LIGHT} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={defId("baseShadow")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="1" stopColor="#000000" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={defId("fadeX")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={INK} />
            <stop offset="0.1" stopColor={INK} stopOpacity="0" />
            <stop offset="0.9" stopColor={INK} stopOpacity="0" />
            <stop offset="1" stopColor={INK} />
          </linearGradient>
          <linearGradient id={defId("fadeY")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={INK} stopOpacity="0" />
            <stop offset="1" stopColor={INK} />
          </linearGradient>
          <filter id={defId("ledBlur")} x="-15%" y="-35%" width="130%" height="170%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <filter id={defId("spillBlur")} x="-15%" y="-45%" width="130%" height="190%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id={defId("haloBlur")} x="-40%" y="-40%" width="180%" height="180%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id={defId("textGlow")} x="-20%" y="-150%" width="140%" height="400%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <clipPath id={defId("glass")}>
            <path d={GLASS_PATH} />
          </clipPath>
          <clipPath id={defId("wall")}>
            <path clipRule="evenodd" d={`${BUILDING_PATH}${GLASS_PATH}`} />
          </clipPath>
        </defs>

        {/* Céu noturno: brilho urbano em azul-real recortando o volume. */}
        <ellipse cx="600" cy="420" rx="640" ry="470" fill={paint("sky")} />

        {/* Monólito de concreto grafite com placas e furos de tirante. */}
        <path d={BUILDING_PATH} fill={paint("concrete")} />
        <path d={BUILDING_PATH} fill={paint("panels")} />
        <path d={BUILDING_PATH} fill={paint("mass")} />
        <path d={BUILDING_PATH} fill={paint("night")} />
        <path
          d={`M${BUILDING.left} ${BUILDING.top + 0.8}H${BUILDING.right}`}
          stroke="#4A5468"
          strokeOpacity="0.6"
          strokeWidth="1.6"
        />

        {/* Pórtico de vidro duplo, recuado sob o concreto. */}
        <g clipPath={paint("glass")}>
          <path d={GLASS_PATH} fill={paint("interior")} />
          <rect
            x={PORTICO_LEFT}
            y={MEZZANINE.top}
            width={GLASS_END_X - PORTICO_LEFT}
            height={MEZZANINE.bottom - MEZZANINE.top}
            fill="#070A12"
          />
          <path d={`M${PORTICO_LEFT} ${MEZZANINE.top}H${GLASS_END_X}`} stroke="#2F3748" strokeWidth="1.2" />
          {DOWNLIGHTS.map((x) => (
            <path key={x} d={downlightPath(x)} fill={paint("cone")} />
          ))}
          <rect x={DESK.left} y={DESK.top} width={DESK.right - DESK.left} height={FLOOR_Y - DESK.top} fill="#0A0E17" />
          <path d={`M${DESK.left} ${DESK.top + 0.5}H${DESK.right}`} stroke="#3A4254" strokeWidth="1.2" />
          <g fill="none">
            <path d={MULLIONS_PATH} stroke="#3A4254" strokeWidth="2.6" />
            <path d={MULLION_SHEEN_PATH} stroke="#6B7489" strokeOpacity="0.45" strokeWidth="0.7" />
            <path d={TRANSOMS_PATH} stroke="#343C4E" strokeWidth="2.2" />
            <path d={DOOR_FRAME_PATH} stroke="#4A5468" strokeWidth="3.2" />
            <path d={DOOR_HANDLES_PATH} stroke="#D3DAE4" strokeWidth="2.2" strokeLinecap="round" />
          </g>
          <path d={GLASS_PATH} fill={paint("tint")} />
          {GLASS_STREAKS.map((d) => (
            <path key={d} d={d} fill={paint("streak")} />
          ))}
          <rect x={PORTICO_LEFT} y={LED_Y} width="30" height={FLOOR_Y - LED_Y} fill={paint("pillarShadow")} />
        </g>
        <path d={`M${PORTICO_LEFT} ${FLOOR_Y}H${GLASS_END_X}`} stroke="#2E3545" strokeWidth="4" />

        {/* Perfil da fita apagado (visível mesmo antes de acender). */}
        <path d={LED_PATH} fill="none" stroke="#2C3241" strokeWidth="5" />

        {/* Luz da fita: lavagem no vidro, raspão no concreto e halo. Acende quando o traço já passou de ~90%
            (t ≈ 1,2 s), para o brilho nunca aparecer à frente da ponta que desenha. */}
        <LightFade delay={1} duration={1.6}>
          <g clipPath={paint("glass")}>
            <path
              d={LED_PATH}
              fill="none"
              stroke={WARM_LIGHT}
              strokeOpacity="0.3"
              strokeWidth="110"
              filter={paint("spillBlur")}
            />
          </g>
          <g clipPath={paint("wall")}>
            <path
              d={LED_PATH}
              fill="none"
              stroke={WARM_LIGHT}
              strokeOpacity="0.14"
              strokeWidth="48"
              filter={paint("spillBlur")}
            />
          </g>
          <path
            d={LED_PATH}
            fill="none"
            stroke="#FFDDA8"
            strokeOpacity="0.55"
            strokeWidth="16"
            filter={paint("ledBlur")}
          />
        </LightFade>
        <LedLine d={LED_PATH} />

        {/* Letreiro iluminado: Torre + Touro sobre NEXFORT CAPITAL e a assinatura. */}
        <LightFade delay={1.35} duration={1.6}>
          <ellipse cx={SIGN.cx} cy={SIGN.emblemTop + 140} rx="300" ry="200" fill={paint("signWash")} />
          <g transform={EMBLEM_TRANSFORM}>
            <image href={EMBLEM_SRC} {...EMBLEM_IMAGE} opacity="0.4" filter={paint("haloBlur")} />
          </g>
          <text {...WORDMARK_TEXT} fill="#FFF4E0" fillOpacity="0.5" filter={paint("textGlow")}>
            {wordmark}
          </text>
        </LightFade>
        <g transform={EMBLEM_TRANSFORM}>
          {/* A logo original, idêntica, no lugar do emblema vetorial. */}
          <image href={EMBLEM_SRC} {...EMBLEM_IMAGE} />
        </g>
        <text {...WORDMARK_TEXT} fill="#F8FAFC">
          {wordmark}
        </text>
        <text
          x={SIGN.cx}
          y={SIGN.taglineY}
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="500"
          textLength={SIGN.width}
          lengthAdjust="spacing"
          className="font-display"
          fill="#AEB8C6"
        >
          {tagline}
        </text>

        {/* Número 253: retroiluminado, com sombra de afastamento da parede. */}
        <LightFade delay={1.6} duration={1.4}>
          <text {...NUMBER_TEXT} fill="#FFE9C7" fillOpacity="0.6" filter={paint("haloBlur")}>
            {number}
          </text>
        </LightFade>
        <text {...NUMBER_TEXT} x={BUILDING_NUMBER.right + 4} y={BUILDING_NUMBER.baseline + 5} fill="#05070C" fillOpacity="0.7">
          {number}
        </text>
        <text {...NUMBER_TEXT} fill={paint("numeral")}>
          {number}
        </text>

        {/* Degraus baixos da entrada. */}
        {STEPS.map((step) => (
          <g key={step.y}>
            <rect x={step.left} y={step.y} width={step.right - step.left} height={STEP_RISE} fill={step.fill} />
            <path d={`M${step.left} ${step.y + 0.6}H${step.right}`} stroke="#566074" strokeWidth="1.2" />
          </g>
        ))}

        {/* Rampa de acessibilidade e corrimãos de aço inox (passam à frente da fita). */}
        <path d={RAMP_SIDE_PATH} fill="#252A36" />
        <path d={RAMP_EDGE_PATH} fill="none" stroke="#3E4658" strokeWidth="1.4" />
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={RAIL_POSTS_PATH} stroke="#7E889B" strokeWidth="1.8" />
          <path d={RAIL_LOW_PATH} stroke="#8C96A8" strokeWidth="1.8" />
          <path d={RAIL_TOP_PATH} stroke="#A7B0C0" strokeWidth="2.4" />
          <path d={RAIL_TOP_PATH} stroke="#F1F5F9" strokeOpacity="0.55" strokeWidth="0.7" transform="translate(0 -0.8)" />
        </g>
        {/* Reflexo quente nos corrimãos: a fita cruza atrás deles em ~90% do percurso. */}
        <LightFade delay={1.25} duration={1.4}>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" stroke={paint("railGlow")}>
            <path d={RAIL_LOW_PATH} strokeWidth="1.8" />
            <path d={RAIL_TOP_PATH} strokeWidth="2.4" />
          </g>
        </LightFade>

        {/* Calçada de piso cinza com a faixa vermelha, meio-fio e gramado. */}
        <rect x="0" y={GROUND_Y} width={FACADE_WIDTH} height={CURB_Y - GROUND_Y} fill={paint("paving")} />
        <rect x="0" y={RED_STRIPE.y} width={FACADE_WIDTH} height={RED_STRIPE.height} fill="#7F1D1D" fillOpacity="0.38" />
        <path d={PAVING_JOINTS_PATH} stroke="#0A0C11" strokeOpacity="0.7" strokeWidth="1" />
        <rect
          x={BUILDING.left}
          y={GROUND_Y}
          width={BUILDING.right - BUILDING.left}
          height="16"
          fill={paint("baseShadow")}
        />
        <ellipse cx={LOBBY_LIGHT_X} cy={GROUND_Y + 6} rx="300" ry="16" fill={paint("lobbyPool")} />
        <LightFade delay={1.45} duration={1.6}>
          <ellipse cx={LED_END_X} cy={GROUND_Y + 5} rx="200" ry="22" fill={paint("pool")} />
        </LightFade>
        <rect x="0" y={CURB_Y} width={FACADE_WIDTH} height={LAWN_Y - CURB_Y} fill="#2A303D" />
        <path d={`M0 ${CURB_Y + 0.5}H${FACADE_WIDTH}`} stroke="#3E4658" strokeWidth="1" />
        <rect x="0" y={LAWN_Y} width={FACADE_WIDTH} height={FACADE_HEIGHT - LAWN_Y} fill={paint("lawn")} />
        <rect x="0" y={LAWN_Y} width={FACADE_WIDTH} height={FACADE_HEIGHT - LAWN_Y} fill={paint("grass")} />

        {/* O chão se dissolve no fundo da página. */}
        <rect x="0" y={GROUND_Y} width={FACADE_WIDTH} height={FACADE_HEIGHT - GROUND_Y} fill={paint("fadeX")} />
        <rect x="0" y={GROUND_Y + 60} width={FACADE_WIDTH} height={FACADE_HEIGHT - GROUND_Y - 60} fill={paint("fadeY")} />
      </svg>
      {/* Grão de concreto só sobre o volume (x 60 → 1140, y 50 → 770). No recorte 1:1 a janela vai de x 300 a 1200. */}
      <div className="concrete-noise pointer-events-none absolute top-[5.56%] right-[6.67%] bottom-[14.44%] left-0 sm:right-[5%] sm:left-[5%]" />
    </FacadeStage>
  );
}
