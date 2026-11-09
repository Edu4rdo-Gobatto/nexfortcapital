// Grava a rolagem real da página (desktop com a roda do mouse, passando pelo Lenis; celular com rolagem nativa).
// Uso: node design/qa/gravacao.mjs [url]
// Saída: design/qa/saida/videos/nexfort-desktop.webm e nexfort-celular.webm
import { mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { launch, readRests, urlArg, waitReady } from "./lib.mjs";

const url = urlArg();
const out = fileURLToPath(new URL("./saida/videos/", import.meta.url));
mkdirSync(out, { recursive: true });

const browser = await launch();

const runs = [
  { name: "desktop", w: 1440, h: 900, step: 70, wait: 90 },
  { name: "celular", w: 390, h: 844, step: 54, wait: 70, mobile: true },
];

for (const vp of runs) {
  const tmp = join(out, `tmp-${vp.name}`);
  const context = await browser.newContext({
    viewport: { width: vp.w, height: vp.h },
    deviceScaleFactor: vp.mobile ? 2 : 1,
    recordVideo: { dir: tmp, size: { width: vp.w, height: vp.h } },
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load" });
  await waitReady(page);
  await page.waitForTimeout(2600); // Chegada
  await page.mouse.move(vp.w / 2, vp.h / 2);

  // rola até o fim, com uma pausa curta em cada descanso para a Torre assentar
  const rests = (await readRests(page)).map((r) => r.s); // os descansos medidos pelo app
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  let next = 1;
  for (let guard = 0; guard < 400; guard++) {
    const y = await page.evaluate(() => scrollY);
    if (y >= max - 2) break;
    if (vp.mobile) await page.evaluate((d) => window.scrollBy({ top: d, behavior: "instant" }), vp.step);
    else await page.mouse.wheel(0, vp.step);
    await page.waitForTimeout(vp.wait);
    if (next < rests.length && y >= rests[next]) {
      await page.waitForTimeout(1400);
      next++;
    }
  }
  await page.waitForTimeout(1500);
  await context.close();
  const file = readdirSync(tmp).find((f) => f.endsWith(".webm"));
  renameSync(join(tmp, file), join(out, `nexfort-${vp.name}.webm`));
  rmSync(tmp, { recursive: true, force: true });
  console.log(join(out, `nexfort-${vp.name}.webm`));
}
await browser.close();
