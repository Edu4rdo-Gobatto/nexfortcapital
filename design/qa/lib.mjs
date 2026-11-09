// Peças comuns dos roteiros de QA: argumentos, o Chrome com GPU, a espera do palco da Torre e os descansos.
import { chromium } from "playwright-core";

/** Windows: ANGLE/D3D11 com a placa de vídeo, mesmo na lista de bloqueio do Chrome. */
export const GPU_ARGS = ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=d3d11"];

/** Valor de --nome=valor, ou o padrão. */
export const flag = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;

/** URL: o primeiro argumento que começa com http (padrão: o servidor local de produção). */
export const urlArg = () => process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:3100/";

/** O Chrome instalado, headless. Sem argumentos usa a GPU; passe outros (ex.: ["--disable-3d-apis"]) para trocar. */
export const launch = (args = GPU_ARGS) => chromium.launch({ channel: "chrome", headless: true, args });

/** Espera o palco da Torre ficar pronto (shaders compilados; é aqui que a Chegada começa). */
export const waitReady = (page, timeout = 20000) => page.waitForSelector(".torre-stage__inner[data-ready]", { state: "attached", timeout });

/**
 * Os descansos da Torre, como o PRÓPRIO app os mediu: cada âncora leva o seu em data-torre-rest (TorreStage.tsx,
 * a cada medição). Nenhum roteiro refaz a regra: se ela mudar, os roteiros acompanham sozinhos.
 * Cada item: { id, s (rolagem em px), hidden (a Torre sai de cena aqui) }, na ordem do documento.
 */
export const readRests = (page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("[data-torre-anchor]")].map((a) => ({
      id: a.dataset.torreAnchor,
      s: Number(a.dataset.torreRest),
      hidden: a.hasAttribute("data-torre-hidden"),
    })),
  );
