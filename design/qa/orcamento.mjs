// Orçamento de desenho: a cena só desenha quando há rolagem (frameloop="demand").
// Conta chamadas de desenho do WebGL parado, rolando com a roda (passa pelo Lenis) e parado de novo,
// e lista as tarefas longas (>50 ms) desde o carregamento.
// Uso: node design/qa/orcamento.mjs [url]
import { launch, urlArg, waitReady } from "./lib.mjs";

const url = urlArg();
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.addInitScript(() => {
  window.__draws = 0;
  for (const Ctx of [WebGLRenderingContext, WebGL2RenderingContext]) {
    for (const fn of ["drawElements", "drawArrays", "drawElementsInstanced", "drawArraysInstanced"]) {
      const original = Ctx.prototype[fn];
      if (!original) continue;
      Ctx.prototype[fn] = function (...args) {
        window.__draws++;
        return original.apply(this, args);
      };
    }
  }
  window.__long = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__long.push(Math.round(e.duration));
  }).observe({ type: "longtask", buffered: true });
});

await page.goto(url, { waitUntil: "load" });
await waitReady(page);
await page.waitForTimeout(3000); // Chegada termina e o amortecimento assenta

const state = () => page.evaluate(() => ({ draws: window.__draws, y: Math.round(scrollY) }));
const idle = async (ms) => {
  const a = (await state()).draws;
  await page.waitForTimeout(ms);
  return (await state()).draws - a;
};

console.log(`parado (2 s): ${await idle(2000)} chamadas de desenho (esperado: 0)`);

await page.mouse.move(720, 450);
const before = await state();
const t0 = Date.now();
for (let i = 0; i < 20; i++) {
  await page.mouse.wheel(0, 60);
  await page.waitForTimeout(50);
}
await page.waitForTimeout(300);
const after = await state();
console.log(`rolando com a roda (${Date.now() - t0} ms): ${after.draws - before.draws} chamadas · scrollY ${before.y} → ${after.y} (precisa mudar)`);

await page.waitForTimeout(2500); // inércia + amortecimento assentam
console.log(`parado de novo (2 s): ${await idle(2000)} chamadas de desenho (esperado: 0)`);

const long = await page.evaluate(() => window.__long);
console.log(`tarefas longas (>50 ms) desde o carregamento: ${long.length ? long.join(", ") + " ms" : "nenhuma"}`);
await browser.close();
