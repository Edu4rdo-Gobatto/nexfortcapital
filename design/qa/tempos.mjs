// Marcas de tempo da Torre (User Timing, gravadas em TorreScene.tsx) e tarefas longas do carregamento.
// Uso: node design/qa/tempos.mjs [url]
import { launch, urlArg, waitReady } from "./lib.mjs";

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => {
  if (m.type() === "warning" || m.type() === "error") console.log(`[${m.type()}]`, m.text().slice(0, 300));
});
await page.addInitScript(() => {
  window.__long = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__long.push([Math.round(e.startTime), Math.round(e.duration)]);
  }).observe({ type: "longtask", buffered: true });
});

await page.goto(urlArg(), { waitUntil: "load" });
await waitReady(page);
await page.waitForTimeout(2500);

const result = await page.evaluate(() => ({
  measures: performance.getEntriesByType("measure").filter((m) => m.name.startsWith("torre")).map((m) => [m.name, Math.round(m.startTime), Math.round(m.duration)]),
  long: window.__long,
}));
for (const [name, start, duration] of result.measures) console.log(`${String(duration).padStart(5)} ms  ${name}  (início em ${start} ms)`);
console.log("tarefas longas [início, duração] ms:", JSON.stringify(result.long));
await browser.close();
