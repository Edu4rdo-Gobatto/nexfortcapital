/**
 * Coreografia da Torre: da rolagem para a pose. Funções puras, sem three.js, para o palco (DOM)
 * calcular o alvo sem puxar o 3D para o pacote principal; a cena só lê o "rig".
 *
 * Âncoras: cada seção tem um espaço vazio [data-torre-anchor] onde a Torre deve estar. Em "descanso"
 * (a seção centralizada na tela; o hero no topo da página) a Torre ocupa a âncora, sempre com o desenho
 * (frente ou verso) virado para o texto: 35° para o lado do texto. Entre dois descansos ela viaja, e gira,
 * com a mesma curva (power3.inOut): o giro só avança, ~3 voltas na página, e termina de frente (o logo).
 * Cada âncora declara data-torre-face ("frente" | "verso") e data-torre-facing ("esquerda" | "direita" |
 * "centro"), o lado do texto; [data-torre-hidden] marca o descanso em que a Torre sai de cena (Sócios).
 */

/** Câmera fixa: lente longa, como foto de produto. Quase sem distorção, a vista frontal bate com o logo. */
export const CAMERA = { fov: 15, z: 30 } as const;

/** Unidades do mundo (no plano z = 0) por pixel CSS, para a altura de tela vh. */
export function worldPerPx(vh: number) {
  return (2 * CAMERA.z * Math.tan((CAMERA.fov * Math.PI) / 360)) / vh;
}

const DEG = Math.PI / 180;
/** Quanto a face fica virada para o lado do texto (3/4): lê o desenho e ainda mostra o volume. */
const FACING_ANGLE = 35 * DEG;
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
};

export type Pose = {
  cx: number;
  cy: number;
  h: number;
  rot: number;
  elev: number;
  shadow: number;
  opacity: number;
};

export type PoseOptions = {
  /** prefers-reduced-motion: sem viagem nem giro; troca de lugar por esmaecimento */
  reduce: boolean;
  /** quanto a Torre esmaece no meio da travessia (layout empilhado do celular, texto passa por cima) */
  dip: number;
  /** quanto a Torre recua (encolhe) no meio da travessia, para cruzar no vão entre os textos */
  shrink: number;
  /** curva da viagem entre âncoras */
  ease: (t: number) => number;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

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
    // da âncora fica pelo menos 8% abaixo do topo da tela: a Torre nunca descansa cortada
    let s = i === 0 ? 0 : clamp(Math.min(sectionCenter - vh / 2, anchorTop - vh * 0.08), 0, maxScroll);
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
    });
  });

  // giros crescentes: todo descanso, também o de fora de cena (a Torre segue girando enquanto esmaece), é o
  // equivalente do ângulo alvo logo à frente do anterior
  unwrapAngles(angles).forEach((theta, i) => (rests[i].theta = theta));
  return rests;
}

/** Pose da Torre para a rolagem s. */
export function poseAt(s: number, rests: Rest[], opts: PoseOptions): Pose {
  const last = rests.length - 1;
  const at = (r: Rest, opacity = 1): Pose => ({ cx: r.cx, cy: r.cy, h: r.h, rot: r.theta, elev: r.elev, shadow: r.shadow, opacity: opacity * r.opacity });

  if (s <= rests[0].s) return at(rests[0]);
  if (s >= rests[last].s) {
    // depois do último descanso a Torre acompanha o conteúdo (o logo montado sobe junto com a página)
    const pose = at(rests[last]);
    pose.cy -= s - rests[last].s;
    return pose;
  }

  let i = 0;
  while (i < last - 1 && s > rests[i + 1].s) i++;
  const a = rests[i];
  const b = rests[i + 1];
  const p = clamp((s - a.s) / (b.s - a.s), 0, 1);

  if (opts.reduce) {
    // sem movimento: some no meio do caminho e reaparece já na próxima âncora, no giro dela
    const r = p < 0.5 ? a : b;
    return at(r, clamp(Math.abs(1 - 2 * p) * 1.25 - 0.25, 0, 1));
  }

  // posição, giro e escala andam juntos, na mesma curva: a Torre chega virada para o texto
  const e = opts.ease(p);
  const mid = Math.sin(Math.PI * p); // 0 nos descansos, 1 no meio da travessia
  return {
    cx: lerp(a.cx, b.cx, e),
    cy: lerp(a.cy, b.cy, e),
    h: lerp(a.h, b.h, e) * (1 - opts.shrink * mid),
    rot: lerp(a.theta, b.theta, e),
    elev: lerp(a.elev, b.elev, e),
    shadow: lerp(a.shadow, b.shadow, e),
    opacity: lerp(a.opacity, b.opacity, e) * (1 - opts.dip * mid),
  };
}

/** Estado compartilhado entre o palco (escreve o alvo) e a cena (amortece e desenha). */
export type TorreTarget = { x: number; y: number; h: number; rot: number; tilt: number; shadow: number };

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
  const zero: TorreTarget = { x: 0, y: 0, h: 1, rot: 0, tilt: 0, shadow: 1 };
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

const KEYS = ["x", "y", "h", "rot", "tilt", "shadow"] as const;

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
