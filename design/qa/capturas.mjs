// Capturas em cada descanso da Torre e no meio de cada travessia, desktop (1440×900) e celular (390×844).
// Também confere, por número, que a Torre (a âncora dela) nunca descansa cortada nem atrás do texto.
// Os descansos vêm do próprio app (data-torre-rest em cada âncora): ver lib.mjs.
// Uso: node design/qa/capturas.mjs [url] [--reduce] [--only=desktop|celular] [--pasta=nome]
// Saída: design/qa/saida/<pasta>/ (padrão: capturas); nomes: <tela>-<n>b-descanso-<âncora>.png
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { flag, launch, readRests, urlArg, waitReady } from "./lib.mjs";

const url = urlArg();
const reduce = process.argv.includes("--reduce");
const only = flag("only");
const out = fileURLToPath(new URL(`./saida/${flag("pasta", "capturas")}/`, import.meta.url));
mkdirSync(out, { recursive: true });

/** A Torre ocupa uma faixa central da âncora: largura ≈ metade da altura (a silhueta mede 0,51 da altura). */
const TORRE_RATIO = 0.51;

const browser = await launch();

const viewports = [
  { name: "desktop", width: 1440, height: 900, dsf: 1 },
  { name: "celular", width: 390, height: 844, dsf: 2, mobile: true },
].filter((vp) => !only || vp.name === only);

for (const vp of viewports) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.dsf,
    isMobile: Boolean(vp.mobile),
    hasTouch: Boolean(vp.mobile),
    reducedMotion: reduce ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  const logs = [];
  page.on("console", (m) => {
    if (["error", "warning"].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`);
  });
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

  await page.goto(url, { waitUntil: "load" });
  const t0 = Date.now();
  let ready = true;
  try {
    await waitReady(page);
  } catch {
    ready = false;
  }
  const readyMs = Date.now() - t0;
  await page.waitForTimeout(2600); // Chegada (1,8 s) + transição de opacidade
  const gl = await page.evaluate(() => {
    const c = document.querySelector(".torre-stage canvas");
    if (!c) return "sem canvas";
    const ctx = c.getContext("webgl2") || c.getContext("webgl");
    const ext = ctx && ctx.getExtension("WEBGL_debug_renderer_info");
    return ext ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) : "renderer desconhecido";
  });
  const tag = `${vp.name}${reduce ? "-reduce" : ""}`;
  console.log(`${tag}: pronto=${ready} em ${readyMs} ms · WebGL: ${gl}`);

  const rests = await readRests(page);
  console.log(`${tag}: descansos`, rests.map((r) => `${r.id}@${r.s}`).join("  "));

  const go = async (y, wait) => {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(wait);
  };
  const problems = [];
  for (let i = 0; i < rests.length; i++) {
    const name = String(i).padStart(2, "0");
    if (i > 0) {
      await go(Math.round((rests[i - 1].s + rests[i].s) / 2), 1400);
      await page.screenshot({ path: join(out, `${tag}-${name}a-travessia-${rests[i].id}.png`) });
    }
    await go(rests[i].s, 2000);
    await page.screenshot({ path: join(out, `${tag}-${name}b-descanso-${rests[i].id}.png`) });

    // a Torre cabe na tela e não fica atrás do texto (a âncora é o lugar dela)
    const box = await page.evaluate(
      ([id, ratio]) => {
        const anchor = document.querySelector(`[data-torre-anchor="${id}"]`);
        const a = anchor.getBoundingClientRect();
        const section = anchor.closest("[data-torre-section]") ?? document;
        const texts = [...section.querySelectorAll("[data-reveal], h1")].map((n) => n.getBoundingClientRect());
        const w = Math.min(a.width, a.height * ratio);
        const cx = a.left + a.width / 2;
        const torre = { l: cx - w / 2, r: cx + w / 2, t: a.top, b: a.bottom };
        const overlap = texts.some((t) => t.width > 0 && torre.l < t.right && torre.r > t.left && torre.t < t.bottom && torre.b > t.top);
        return { top: Math.round(a.top), bottom: Math.round(a.bottom), vh: innerHeight, overlap };
      },
      [rests[i].id, TORRE_RATIO],
    );
    if (!rests[i].hidden) {
      const cut = box.top < 0 || box.bottom > box.vh;
      console.log(`  ${rests[i].id.padEnd(22)} âncora ${box.top}–${box.bottom} de ${box.vh}${cut ? "  CORTADA" : ""}${box.overlap && vp.name === "desktop" ? "  ATRÁS DO TEXTO" : ""}`);
      if (cut || (box.overlap && vp.name === "desktop")) problems.push(rests[i].id);
    }
  }
  await go(999999, 2000);
  await page.screenshot({ path: join(out, `${tag}-99-fim.png`) });
  console.log(`${tag}: ${problems.length ? "PROBLEMAS em " + problems.join(", ") : "Torre inteira e fora do texto em todos os descansos"}`);

  if (logs.length) console.log(`${tag}: console\n  ` + logs.slice(0, 12).join("\n  "));
  await context.close();
}

await browser.close();
console.log(`capturas em ${out}`);
