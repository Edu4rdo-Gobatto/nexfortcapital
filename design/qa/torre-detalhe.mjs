// Recorte da Torre num descanso, em resolução maior: serve para julgar o desenho do miolo e a prancha.
// Uso: node design/qa/torre-detalhe.mjs [url] --rest=assinatura[,hero,...] [--nome=prefixo] [--pasta=detalhe] [--dsf=2] [--vw=1440] [--vh=900] [--lockup=1700]
// --meio=ID[,ID] captura o MEIO da travessia até a âncora ID (a Torre a meio giro: onde se vê a emenda lateral entre as faces).
// --lockup=PX amplia a assinatura (largura do nome, em px; a Torre mede 0,2992 disso): serve para ver o miolo de frente em tamanho grande.
// Use com --vw/--vh maiores (ex.: --vw=2000 --vh=1300).
// Os descansos vêm do próprio app (data-torre-rest, ver lib.mjs). Saída: design/qa/saida/<pasta>/<nome>-<descanso>.png
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { flag, launch, readRests, urlArg, waitReady } from "./lib.mjs";

const url = urlArg();
const meio = flag("meio", "").split(",").filter(Boolean);
const ids = flag("rest", meio.length ? "" : "assinatura").split(",").filter(Boolean);
const prefix = flag("nome", "torre");
const dsf = Number(flag("dsf", "2"));
const vw = Number(flag("vw", "1440"));
const vh = Number(flag("vh", "900"));
const lockup = flag("lockup");
const out = fileURLToPath(new URL(`./saida/${flag("pasta", "detalhe")}/`, import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await launch();
const context = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: dsf });
const page = await context.newPage();
await page.goto(url, { waitUntil: "load" });
await waitReady(page);
await page.waitForTimeout(2600);
if (lockup) {
  await page.evaluate((px) => {
    document.querySelector(".lockup").style.setProperty("--lockup-w", `${px}px`);
    window.dispatchEvent(new Event("resize"));
  }, lockup);
  await page.waitForTimeout(1500); // o app mede de novo e atualiza os descansos
}
const rests = await readRests(page);

// meio da travessia: entre o descanso anterior e o desta âncora; recorta a faixa central da tela
for (const id of meio) {
  const i = rests.findIndex((r) => r.id === id);
  if (i < 1) continue;
  await page.evaluate((v) => window.scrollTo(0, v), Math.round((rests[i - 1].s + rests[i].s) / 2));
  await page.waitForTimeout(2200);
  const file = join(out, `${prefix}-meio-${id}.png`);
  await page.screenshot({ path: file, clip: { x: vw / 2 - 300, y: vh * 0.08, width: 600, height: vh * 0.84 } });
  console.log(file);
}

for (const id of ids) {
  const rest = rests.find((r) => r.id === id);
  if (!rest) {
    console.log(`${id}: âncora não encontrada`);
    continue;
  }
  await page.evaluate((v) => window.scrollTo(0, v), rest.s);
  await page.waitForTimeout(2200);
  const box = await page.evaluate((id) => {
    const a = document.querySelector(`[data-torre-anchor="${id}"]`).getBoundingClientRect();
    // a Torre ocupa a faixa central da âncora (largura ≈ 0,51 da altura); o recorte leva uma folga
    const w = Math.min(a.width, a.height * 0.62);
    const cx = a.left + a.width / 2;
    return { x: cx - w / 2, y: a.top - a.height * 0.04, width: w, height: a.height * 1.12 };
  }, id);
  const file = join(out, `${prefix}-${id}.png`);
  await page.screenshot({ path: file, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.width, height: Math.min(vh - Math.max(0, box.y), box.height) } });
  console.log(file);
}
await browser.close();
