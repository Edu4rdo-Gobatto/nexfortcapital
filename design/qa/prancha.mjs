// Confere a prancha (design/prancha/index.html): captura cada quadro, acusa imagem quebrada e barra horizontal.
// Uso: node design/qa/prancha.mjs [--largura=1280]
// Saída: design/qa/saida/prancha-pagina/<quadro>.png
import { mkdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join } from "node:path";
import { chromium } from "playwright-core";

const width = Number(process.argv.find((a) => a.startsWith("--largura="))?.split("=")[1] ?? 1280);
const out = fileURLToPath(new URL("./saida/prancha-pagina/", import.meta.url));
mkdirSync(out, { recursive: true });
const page_url = pathToFileURL(fileURLToPath(new URL("../prancha/index.html", import.meta.url))).href;

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width, height: 900 } });
await page.goto(page_url, { waitUntil: "load" });
await page.waitForTimeout(2500); // fontes
// as imagens são preguiçosas (loading="lazy"): rola a página inteira para carregar todas antes de conferir
const total = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < total; y += 700) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(120);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
for (const id of ["paleta", "miolo", "faces", "tipografia", "revelacao", "medidas", "trocar"]) {
  const box = await (await page.$(`#${id}`)).boundingBox();
  await page.screenshot({ path: join(out, `${id}.png`), clip: { x: 0, y: box.y, width, height: Math.min(box.height, 2600) }, fullPage: true });
  console.log(`${id}: y ${Math.round(box.y)}, altura ${Math.round(box.height)}`);
}
const broken = await page.evaluate(() => [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute("src")));
console.log("imagens quebradas:", broken.length ? broken.join(", ") : "nenhuma");
const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log("excesso horizontal:", overflow, "px");
if (overflow > 0) {
  // quem passa da borda direita (ignora o que está dentro de um contêiner com rolagem própria)
  const culprits = await page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((el) => !el.closest(".scroll") && el.getBoundingClientRect().right > innerWidth + 1)
      .slice(0, 6)
      .map((el) => `${el.tagName.toLowerCase()}${el.className ? "." + String(el.className).split(" ").join(".") : ""} direita=${Math.round(el.getBoundingClientRect().right)}`),
  );
  console.log("passam da borda:", culprits.join(" | "));
}
await browser.close();
console.log(`capturas em ${out}`);
