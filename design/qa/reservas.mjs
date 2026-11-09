// Reservas: sem JavaScript e sem WebGL, o emblema 2D aparece nas âncoras e todo o texto fica legível.
// Uso: node design/qa/reservas.mjs [url]
// Saída: design/qa/saida/reservas/
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:3100/";
const out = fileURLToPath(new URL("./saida/reservas/", import.meta.url));
mkdirSync(out, { recursive: true });

const cases = [
  { name: "sem-js", launch: [], context: { javaScriptEnabled: false } },
  { name: "sem-webgl", launch: ["--disable-3d-apis"], context: {} },
];

for (const c of cases) {
  const browser = await chromium.launch({ channel: "chrome", headless: true, args: c.launch });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, ...c.context });
  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => ({
    webgl: document.documentElement.dataset.webgl ?? "-",
    emblemas: [...document.querySelectorAll(".torre-fallback")].filter((e) => getComputedStyle(e).display !== "none").length,
    textoOcultoNaCarga: [...document.querySelectorAll("[data-reveal-item], h1, h2")].filter((e) => getComputedStyle(e).opacity === "0").length,
  }));
  // sem JS nada pode nascer oculto; sem WebGL, o oculto na carga é só o que espera a revelação abaixo da dobra
  console.log(c.name, JSON.stringify(info));
  await page.screenshot({ path: join(out, `${c.name}-topo.png`) });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 900, k = 1; y < height; y += 900, k++) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: join(out, `${c.name}-${String(k).padStart(2, "0")}.png`) });
  }
  await browser.close();
}
console.log(`capturas em ${out}`);
