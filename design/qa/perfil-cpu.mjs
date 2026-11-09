// Perfil de CPU do carregamento (via protocolo do DevTools): as funções que mais gastam tempo próprio e as
// pilhas da mais pesada. Útil para achar a causa de uma tarefa longa (foi assim que achamos a compilação
// síncrona de shaders). Uso: node design/qa/perfil-cpu.mjs [url]
import { launch, urlArg, waitReady } from "./lib.mjs";

const url = urlArg();
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const cdp = await page.context().newCDPSession(page);
await cdp.send("Profiler.enable");
await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
await cdp.send("Profiler.start");
await page.goto(url, { waitUntil: "load" });
await waitReady(page);
await page.waitForTimeout(2500);
const { profile } = await cdp.send("Profiler.stop");

const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
const parent = new Map();
for (const n of profile.nodes) for (const c of n.children ?? []) parent.set(c, n.id);
const label = (n) => `${n.callFrame.functionName || "(anônima)"}  ${n.callFrame.url.split("/").pop()}:${n.callFrame.lineNumber}:${n.callFrame.columnNumber}`;

const self = new Map();
profile.samples.forEach((id, i) => {
  const key = label(nodes.get(id));
  self.set(key, (self.get(key) ?? 0) + (profile.timeDeltas[i] ?? 0) / 1000);
});
const top = [...self.entries()].filter(([k]) => !k.startsWith("(idle)")).sort((a, b) => b[1] - a[1]).slice(0, 15);
for (const [k, ms] of top) console.log(`${ms.toFixed(0).padStart(6)} ms  ${k}`);

// pilhas da função mais pesada
const heaviest = top[0]?.[0];
const stacks = new Map();
profile.samples.forEach((id, i) => {
  if (label(nodes.get(id)) !== heaviest) return;
  const chain = [];
  for (let cur = id, k = 0; cur && k < 9; k++, cur = parent.get(cur)) chain.push(label(nodes.get(cur)).split("  ")[0]);
  const key = chain.join(" < ");
  stacks.set(key, (stacks.get(key) ?? 0) + (profile.timeDeltas[i] ?? 0) / 1000);
});
console.log(`\npilhas de "${heaviest}":`);
for (const [k, ms] of [...stacks.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4)) console.log(`${ms.toFixed(0).padStart(6)} ms  ${k}`);
await browser.close();
