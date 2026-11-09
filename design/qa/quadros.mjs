// Extrai quadros de um vídeo gravado, para conferir que o WebGL saiu na gravação (e não quadros pretos).
// Uso: node design/qa/quadros.mjs [nexfort-desktop.webm] [segundos separados por vírgula]
// Saída: design/qa/saida/videos/quadro-N.png
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";
import { chromium } from "playwright-core";

const dir = fileURLToPath(new URL("./saida/videos/", import.meta.url));
const video = process.argv[2] ?? "nexfort-desktop.webm";
const mobile = video.includes("celular"); // o vídeo do celular tem 390×844
const W = mobile ? 390 : 1440;
const H = mobile ? 844 : 900;
const times = (process.argv[3] ?? "3.5,6.5,9.5,13").split(",").map(Number);
const page_html = join(dir, "ver.html");
writeFileSync(page_html, `<!doctype html><video id="v" src="${video}" muted style="width:${W}px;height:${H}px;display:block"></video>`);

const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(pathToFileURL(page_html).href);
await page.waitForFunction(() => document.getElementById("v").readyState >= 2, null, { timeout: 15000 });
console.log("duração (s):", await page.evaluate(() => document.getElementById("v").duration));
for (const [k, t] of times.entries()) {
  await page.evaluate((tt) => new Promise((r) => { const v = document.getElementById("v"); v.onseeked = () => r(); v.currentTime = tt; }), t);
  await page.screenshot({ path: join(dir, `quadro-${k}.png`) });
}
await browser.close();
console.log(`quadros em ${dir}`);
