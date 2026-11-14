/**
 * Coreografia da Torre: da rolagem para a pose. Funções puras, sem three.js, para o palco (DOM)
 * calcular o alvo sem puxar o 3D para o pacote principal; a cena só lê o "rig".
 *
 * Âncoras: cada seção tem um espaço vazio [data-torre-anchor] onde a Torre deve estar. Em "descanso"
 * (a seção centralizada na tela; o hero no topo da página) a Torre ocupa a âncora, sempre com o desenho
 * (frente ou verso) virado para o texto: 22° para o lado do texto. Cada âncora declara data-torre-face
 * ("frente" | "verso") e data-torre-facing ("esquerda" | "direita" | "centro"), o lado do texto;
 * [data-torre-hidden] marca o descanso em que a Torre sai de cena (sinais, diagnóstico, Sócios, dúvidas);
 * [data-torre-explode], o descanso em que ela se desmonta nas três partes do método.
 *
 * Dois modos de estar na página:
 *  - PRESA a uma âncora (`dock`): o canvas se centra na âncora e rola junto com a página, então a Torre fica
 *    cravada no bloco, alinhada ao nicho, como uma imagem dele. É assim no celular (layout empilhado), com
 *    "menos movimento" e, no desktop, ao lado de um descanso fora de cena: ela entra e sai com o bloco, inteira.
 *  - VIAJANDO entre duas âncoras visíveis (só no desktop): canvas fixo na tela; posição, giro e escala andam
 *    juntos na mesma curva (power3.inOut).
 * O giro só avança com a rolagem e termina de frente (o logo).
 */

/** Câmera fixa: lente longa, como foto de produto. Quase sem distorção, a vista frontal bate com o logo. */
export const CAMERA = { fov: 15, z: 30 } as const;

/** Unidades do mundo (no plano z = 0) por pixel CSS, para a altura de tela vh. */
export function worldPerPx(vh: number) {
  return (2 * CAMERA.z * Math.tan((CAMERA.fov * Math.PI) / 360)) / vh;
}

const DEG = Math.PI / 180;
/** Altura do cabeçalho fixo (px): a seção descansa centralizada na área que sobra abaixo dele. */
const HEADER_PX = 72;
/**
 * Quanto a face fica virada para o lado do texto. Em 35° o desenho virava uma mancha: a projeção encurta e o
 * focinho do urso some atrás do limbo. Em 22° o urso e o touro leem inteiros e a peça ainda mostra volume.
 */
const FACING_ANGLE = 22 * DEG;
export type Face = "frente" | "verso";
export type Facing = "esquerda" | "direita" | "centro";

export type Rest = {
  /** rolagem em que a Torre descansa nesta âncora */
  s: number;
  /** centro e altura da âncora na tela, em descanso (px CSS) */
  cx: number;
  cy: number;
  h: number;
  /** elevação da vista (rad): leve, de cima, nos blocos; zero na assinatura (vista do logo) */
  elev: number;
  /** sombra de contato (0..1): some na assinatura, onde a Torre vira logo */
  shadow: number;
  /** giro (rad) neste descanso: a face virada para o texto; só cresce de um descanso para o seguinte */
  theta: number;
  /** 0 = fora de cena (Sócios), 1 = visível */
  opacity: number;
  /** 1 = desmontada nas três partes do método (base, corpo, coroa); 0 = fechada, como no logo */
  explode: number;
};

export type Pose = {
  /** centro (px) no canvas, que tem o tamanho da tela */
  cx: number;
  cy: number;
  h: number;
  rot: number;
  elev: number;
  shadow: number;
  opacity: number;
  explode: number;
  /**
   * Presa a uma âncora: Y do documento (px) em que o topo do canvas fica; ele então rola com a página e a Torre
   * está sempre no meio dele. null: a Torre viaja entre âncoras e o canvas fica fixo na tela.
   */
  dock: number | null;
};

export type PoseOptions = {
  /** layout empilhado (celular) ou "menos movimento": a Torre não viaja; fica sempre presa à âncora mais próxima */
  docked: boolean;
  /** prefers-reduced-motion: presa, sem girar com a rolagem e já desmontada onde se desmonta */
  reduce: boolean;
  /** quanto a Torre recua (encolhe) no meio da travessia, para cruzar no vão entre os textos */
  shrink: number;
  /** curva da viagem entre âncoras */
  ease: (t: number) => number;
  /** altura da tela (px): a do canvas */
  vh: number;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Quanto a Torre gira, presa a uma âncora, a cada altura de tela rolada: só com a rolagem, e devagar. */
const DOCKED_TURN = 30 * DEG;

/**
 * Giro (rad) em que a face fica virada para o lado do texto. A normal da frente é (sen θ, 0, cos θ) e a do
 * verso é (−sen θ, 0, −cos θ): frente à esquerda = −35°, à direita = +35°; verso à direita = 215°, à esquerda
 * = 145°. De frente, sem lado ("centro"): 0° (frente) ou 180° (verso).
 */
function faceAngle(face: Face, facing: Facing) {
  const side = facing === "esquerda" ? -FACING_ANGLE : facing === "direita" ? FACING_ANGLE : 0;
  return side + (face === "verso" ? Math.PI : 0);
}

/** Giros dos descansos: cada um é o equivalente (mod 360°) do ângulo alvo logo à frente do anterior. */
function unwrapAngles(targets: number[]) {
  const turn = 2 * Math.PI;
  const out: number[] = [];
  targets.forEach((target, i) => {
    let theta = target;
    if (i > 0) theta += turn * Math.ceil((out[i - 1] - target) / turn - 1e-6); // iguais: fica no lugar, não ganha uma volta
    out.push(theta);
  });
  return out;
}

/** Mede as âncoras (na ordem do documento) e devolve os descansos. */
export function measureRests(anchors: HTMLElement[], vh: number, maxScroll: number): Rest[] {
  const sy = window.scrollY;
  const rests: Rest[] = [];
  const angles: number[] = []; // o ângulo alvo de cada âncora, antes de desenrolar as voltas
  anchors.forEach((el, i) => {
    const section = el.closest<HTMLElement>("[data-torre-section]") ?? el;
    const sr = section.getBoundingClientRect();
    const ar = el.getBoundingClientRect();
    const sectionCenter = sr.top + sy + sr.height / 2;
    const anchorTop = ar.top + sy;
    // seção centralizada; mas se ela for mais alta que a tela (celular, Torre em cima do texto), o topo
    // da âncora fica pelo menos 12% abaixo do topo da tela: a Torre nunca descansa cortada nem sob o cabeçalho fixo
    let s = i === 0 ? 0 : clamp(Math.min(sectionCenter - (vh + HEADER_PX) / 2, anchorTop - vh * 0.12), 0, maxScroll);
    const prev = rests[rests.length - 1];
    if (prev && s <= prev.s) s = prev.s + 1; // descansos sempre crescentes
    const hidden = el.dataset.torreHidden !== undefined;
    const face = (el.dataset.torreFace as Face | undefined) ?? "frente";
    const facing = (el.dataset.torreFacing as Facing | undefined) ?? "esquerda";
    angles.push(faceAngle(face, facing));
    rests.push({
      s,
      cx: ar.left + ar.width / 2,
      cy: ar.top + sy - s + ar.height / 2,
      h: ar.height * Number(el.dataset.torreFill ?? 1),
      elev: Number(el.dataset.torreElev ?? 6) * DEG,
      shadow: Number(el.dataset.torreShadow ?? 1),
      theta: 0,
      opacity: hidden ? 0 : 1,
      explode: el.dataset.torreExplode !== undefined ? 1 : 0,
    });
  });

  // giros crescentes: todo descanso, também o de fora de cena (a Torre segue girando enquanto esmaece), é o
  // equivalente do ângulo alvo logo à frente do anterior
  unwrapAngles(angles).forEach((theta, i) => (rests[i].theta = theta));
  return rests;
}

/**
 * A Torre presa à âncora do descanso r. O canvas se centra na âncora e rola junto com a página (`dock`): a
 * Torre fica cravada no bloco sem depender do JavaScript para acompanhar o dedo (no celular a rolagem é do
 * próprio navegador, e um canvas fixo reposicionado por script chegaria sempre atrasado). O giro avança
 * devagar com a rolagem e passa pelo ângulo do descanso exatamente no descanso; onde a Torre se desmonta, ela
 * só fica aberta perto do meio da tela.
 */
function dockedAt(r: Rest, s: number, opts: PoseOptions, opacity = 1): Pose {
  const center = r.cy + r.s; // Y do centro da âncora no documento
  const away = Math.abs(center - s - opts.vh / 2) / opts.vh; // distância do meio da tela, em alturas de tela
  const open = opts.reduce ? 1 : 1 - smooth(clamp((away - 0.2) / 0.35, 0, 1));
  return {
    cx: r.cx,
    cy: opts.vh / 2,
    h: r.h,
    rot: r.theta + (opts.reduce ? 0 : DOCKED_TURN * clamp((s - r.s) / opts.vh, -1.2, 1.2)),
    elev: r.elev,
    shadow: r.shadow,
    opacity: opacity * r.opacity,
    explode: r.explode * open,
    dock: center - opts.vh / 2,
  };
}

/** Pose da Torre para a rolagem s. */
export function poseAt(s: number, rests: Rest[], opts: PoseOptions): Pose {
  const last = rests.length - 1;

  if (opts.docked) {
    // Celular (empilhado) e "menos movimento": a Torre não viaja. Fica presa à âncora visível mais próxima do meio
    // da tela. No celular a troca de âncora acontece com as duas fora da tela; onde as duas ainda aparecem (tela
    // larga com menos movimento), ela some numa e reaparece na outra: a opacidade zera no ponto da troca.
    const middle = s + opts.vh / 2;
    let best = -1;
    let nearest = Infinity;
    let second = Infinity;
    rests.forEach((r, i) => {
      if (!r.opacity) return;
      const distance = Math.abs(r.cy + r.s - middle);
      if (distance < nearest) {
        second = nearest;
        nearest = distance;
        best = i;
      } else if (distance < second) {
        second = distance;
      }
    });
    if (best < 0) return dockedAt(rests[0], s, opts, 0);
    return dockedAt(rests[best], s, opts, clamp((second - nearest) / (0.25 * opts.vh), 0, 1));
  }

  // antes do primeiro descanso e depois do último, a Torre é do bloco: sobe e desce com a página
  if (s <= rests[0].s) return dockedAt(rests[0], s, opts);
  if (s >= rests[last].s) return dockedAt(rests[last], s, opts);

  let i = 0;
  while (i < last - 1 && s > rests[i + 1].s) i++;
  const a = rests[i];
  const b = rests[i + 1];
  const p = clamp((s - a.s) / (b.s - a.s), 0, 1);

  // Ao lado de um descanso fora de cena a Torre não viaja nem esmaece pelo caminho (ficava um fantasma cruzando a
  // página): sai e entra presa ao seu bloco, inteira, junto com ele. O esmaecimento nas pontas só cobre a troca
  // de âncora, que quase sempre acontece com a Torre já fora da tela.
  if (!b.opacity) return dockedAt(a, s, opts, 1 - clamp((p - 0.85) / 0.15, 0, 1));
  if (!a.opacity) return dockedAt(b, s, opts, clamp(p / 0.15, 0, 1));

  // Entre dois descansos visíveis ela viaja: posição, giro e escala andam juntos, na mesma curva, e a Torre
  // chega virada para o texto. No meio do caminho recua, para cruzar no vão entre os textos.
  const e = opts.ease(p);
  const mid = Math.sin(Math.PI * p); // 0 nos descansos, 1 no meio da travessia
  return {
    cx: lerp(a.cx, b.cx, e),
    cy: lerp(a.cy, b.cy, e),
    h: lerp(a.h, b.h, e) * (1 - opts.shrink * mid),
    rot: lerp(a.theta, b.theta, e),
    elev: lerp(a.elev, b.elev, e),
    shadow: lerp(a.shadow, b.shadow, e),
    opacity: 1,
    // a Torre viaja fechada: abre só na chegada (segunda metade da travessia) e fecha antes de partir (primeira)
    explode: lerp(a.explode, b.explode, opts.ease(b.explode > a.explode ? clamp(2 * p - 1, 0, 1) : clamp(2 * p, 0, 1))),
    dock: null,
  };
}

/** Estado compartilhado entre o palco (escreve o alvo) e a cena (amortece e desenha). */
export type TorreTarget = { x: number; y: number; h: number; rot: number; tilt: number; shadow: number; explode: number };

export type TorreRig = {
  target: TorreTarget;
  current: TorreTarget;
  /** Chegada: luz de 0 a 1 e um giro extra que zera ao fim */
  intro: { light: number; spin: number };
  /** primeira pose: copia o alvo sem amortecer */
  snap: boolean;
  /** sem amortecimento: a pose vai direto ao alvo (menos movimento: a Torre troca de lugar esmaecida, sem deslizar nem girar) */
  instant: boolean;
  /** registrados pela cena quando ela monta */
  invalidate?: () => void;
  /** chamado pela cena quando os shaders estão compilados */
  onReady?: () => void;
  /** reduz a resolução se a Chegada mostrar quadros lentos */
  onSlow?: () => void;
};

export function createRig(): TorreRig {
  const zero: TorreTarget = { x: 0, y: 0, h: 1, rot: 0, tilt: 0, shadow: 1, explode: 0 };
  return { target: { ...zero }, current: { ...zero }, intro: { light: 0, spin: 0 }, snap: true, instant: false };
}

/*
 * O rig é um estado externo e mutável (como o de um jogo), compartilhado entre o DOM e o WebGL.
 * Toda escrita nele passa por estas funções, fora dos componentes: o React só guarda a referência.
 */

/** Cria o rig na primeira vez que alguém pede (efeitos e callbacks; nunca durante o render). */
export function ensureRig(holder: { current: TorreRig | null }) {
  holder.current ??= createRig();
  return holder.current;
}

export function writeTarget(rig: TorreRig, values: TorreTarget) {
  // Salto do alvo (âncora do cabeçalho, arrasto da barra de rolagem): a Torre é idêntica a cada 360°, então o giro
  // atual troca de volta pelo equivalente e o amortecimento percorre no máximo meia volta, em vez de ~3 voltas em
  // meio segundo. Só o alvo decide: um arremesso de roda, em que o atraso passa de 180°, não pode inverter o giro.
  const turn = 2 * Math.PI;
  const jump = values.rot - rig.target.rot;
  if (Math.abs(jump) > Math.PI) rig.current.rot += Math.round(jump / turn) * turn;
  Object.assign(rig.target, values);
}

export function requestSnap(rig: TorreRig) {
  rig.snap = true;
}

/** Liga ou desliga o modo sem amortecimento (menos movimento): a escolha vale até a próxima mudança da preferência. */
export function setInstant(rig: TorreRig, instant: boolean) {
  rig.instant = instant;
}

/** A cena se registra no rig ao montar; devolve a função que a desregistra. */
export function attachScene(rig: TorreRig, hooks: { invalidate: () => void; onSlow: () => void }) {
  rig.invalidate = hooks.invalidate;
  rig.onSlow = hooks.onSlow;
  return () => {
    rig.invalidate = undefined;
    rig.onSlow = undefined;
  };
}

/** O palco registra o que fazer quando a cena estiver pronta (a Chegada). */
export function onSceneReady(rig: TorreRig, handler: () => void) {
  rig.onReady = handler;
  return () => {
    rig.onReady = undefined;
  };
}

const KEYS = ["x", "y", "h", "rot", "tilt", "shadow", "explode"] as const;

/** Um quadro de amortecimento exponencial em direção ao alvo. Devolve true enquanto ainda se move. */
export function stepRig(rig: TorreRig, delta: number, damping: number, eps = 1e-4) {
  const { target: t, current: c } = rig;
  if (rig.snap || rig.instant) {
    Object.assign(c, t);
    rig.snap = false;
  }
  const k = 1 - Math.exp(-damping * Math.min(delta, 0.05));
  let moving = false;
  for (const key of KEYS) {
    const d = t[key] - c[key];
    if (Math.abs(d) > eps) {
      c[key] += d * k;
      moving = true;
    } else {
      c[key] = t[key];
    }
  }
  return moving;
}

/** Conta os primeiros quadros contínuos (a Chegada); se a média passar de 25 ms, pede menos resolução. */
export function sampleIntroFrame(rig: TorreRig, sample: { count: number; time: number }, delta: number) {
  const { light } = rig.intro;
  if (light <= 0 || light >= 1 || sample.count >= 40) return;
  sample.count += 1;
  sample.time += delta;
  if (sample.count === 40 && sample.time / 40 > 1 / 40) rig.onSlow?.();
}
