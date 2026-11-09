// Revelação: mede o estado inicial e final de cada coluna de texto, a direção por largura de tela, que acontece uma
// vez só, que só transform/opacity se movem, que o texto vai no mesmo sentido da Torre e que não há barra horizontal.
// Uso: node design/qa/revelacao.mjs [url]
import { launch, urlArg, waitReady } from "./lib.mjs";

const url = urlArg();
const browser = await launch();

const cases = [
  { name: "desktop 1440", width: 1440, height: 900, reduce: false },
  { name: "tablet 820 (empilhado)", width: 820, height: 1180, reduce: false },
  { name: "celular 390", width: 390, height: 844, reduce: false, mobile: true },
  { name: "desktop 1440, menos movimento", width: 1440, height: 900, reduce: true },
];

// translate (x, y) de uma matriz CSS computada; "none" = (0, 0)
const parse = (t) => {
  if (!t || t === "none") return { x: 0, y: 0 };
  const m = t.match(/matrix\(([^)]+)\)/);
  const v = m ? m[1].split(",").map(Number) : [1, 0, 0, 1, 0, 0];
  return { x: Math.round(v[4]), y: Math.round(v[5]) };
};

let failures = 0;
const check = (ok, label) => {
  if (!ok) failures++;
  console.log(`  ${ok ? "ok  " : "FALHA"} ${label}`);
};

for (const c of cases) {
  console.log(`\n== ${c.name}`);
  const context = await browser.newContext({
    viewport: { width: c.width, height: c.height },
    isMobile: Boolean(c.mobile),
    hasTouch: Boolean(c.mobile),
    reducedMotion: c.reduce ? "reduce" : "no-preference",
  });
  const page = await context.newPage();

  // hero: no instante do carregamento ainda está no quadro inicial da animação CSS (fill both)
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const hero0 = await page.evaluate(() => {
    const line = document.querySelector(".hero-line");
    return line ? { t: getComputedStyle(line).transform, o: getComputedStyle(line).opacity, name: getComputedStyle(line).animationName } : null;
  });
  if (hero0) {
    const h = parse(hero0.t);
    if (c.reduce) check(h.x === 0 && h.y === 0, `hero (menos movimento): só opacidade, animação "${hero0.name}", transform ${hero0.t}`);
    else if (c.width >= 1024) check(h.x === -48 && h.y === 0, `hero entra da ESQUERDA (translateX ${h.x}px), animação "${hero0.name}"`);
    else check(h.x === 0 && h.y === 24, `hero sobe (translateY ${h.y}px), animação "${hero0.name}"`);
  }

  await waitReady(page);
  await page.waitForTimeout(2600);

  const roots = await page.evaluate(() => {
    const vw = innerWidth;
    return [...document.querySelectorAll("[data-reveal]")].map((root) => {
      const item = root.querySelector("[data-reveal-item]");
      const r = root.getBoundingClientRect();
      const cs = getComputedStyle(item);
      return {
        id: root.closest("section")?.id ?? "?",
        from: root.dataset.revealFrom,
        side: r.left + r.width / 2 < vw / 2 ? "esquerda" : "direita",
        revealed: root.hasAttribute("data-revealed"),
        t: cs.transform,
        o: cs.opacity,
        props: cs.transitionProperty,
        dur: cs.transitionDuration,
        ease: cs.transitionTimingFunction,
      };
    });
  });
  console.log(`  ${roots.length} colunas de texto reveladas pelo Reveal`);

  const hidden = roots.filter((r) => !r.revealed);
  for (const r of hidden) {
    const { x, y } = parse(r.t);
    const label = `${r.id} (coluna à ${r.side}, from=${r.from})`;
    if (c.reduce) check(x === 0 && y === 0 && r.o === "0", `${label}: escondido só por opacidade (transform ${r.t}, opacity ${r.o})`);
    else if (c.width >= 1024) check(x === (r.from === "left" ? -48 : 48) && y === 0 && r.o === "0", `${label}: nasce ${x}px no lado, opacity ${r.o}`);
    else check(x === 0 && y === 24 && r.o === "0", `${label}: nasce 24px abaixo, opacity ${r.o}`);
    if (!c.reduce && c.width >= 1024) check((r.from === "left") === (r.side === "esquerda"), `${label}: o lado da coluna é o de onde ela entra`);
  }
  const sample = roots[0];
  check(/opacity/.test(sample.props) && (c.reduce || /transform/.test(sample.props)) && !/all|width|height|margin|top|left/.test(sample.props), `só opacity e transform animam (transition-property: ${sample.props})`);
  check(sample.dur.split(", ").every((d) => d === (c.reduce ? "0.5s" : "0.9s")), `duração ${sample.dur} (${c.reduce ? "menos movimento: 500 ms" : "900 ms"})`);
  check(/cubic-bezier\(0\.22, 1, 0\.36, 1\)/.test(sample.ease), `curva ${sample.ease}`);

  // percorre a página inteira: tudo revela, uma vez, sem barra horizontal
  const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  let overflow = 0;
  for (let y = 0; y <= max + 400; y += 300) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(160);
    overflow = Math.max(overflow, await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  }
  await page.waitForTimeout(1400);
  const after = await page.evaluate(() =>
    [...document.querySelectorAll("[data-reveal]")].map((root) => {
      const items = [...root.querySelectorAll("[data-reveal-item], .reveal-line")];
      return {
        revealed: root.hasAttribute("data-revealed"),
        visible: items.every((n) => getComputedStyle(n).opacity === "1" && (getComputedStyle(n).transform === "none" || getComputedStyle(n).transform === "matrix(1, 0, 0, 1, 0, 0)")),
        lines: root.querySelectorAll(".reveal-line").length,
      };
    }),
  );
  check(after.every((r) => r.revealed && r.visible), `no fim, ${after.length}/${after.length} colunas reveladas (opacity 1, sem deslocamento)`);
  check(after.some((r) => r.lines > 0), `títulos divididos em linhas (${after.reduce((n, r) => n + r.lines, 0)} linhas, sem máscara: ${await page.evaluate(() => document.querySelectorAll(".reveal-line-mask, [class*='-mask']").length)} máscaras)`);
  check(overflow <= 0, `sem barra de rolagem horizontal (maior excesso ${overflow}px)`);

  // uma vez só: volta ao topo e à primeira coluna; continua revelada, sem esconder de novo
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  const again = await page.evaluate(() => [...document.querySelectorAll("[data-reveal]")].every((r) => r.hasAttribute("data-revealed")));
  check(again, "uma vez só: depois de voltar ao topo nada se esconde de novo");

  // a Torre e o texto andam no mesmo sentido (só no desktop, onde a cena anda na horizontal)
  if (c.width >= 1024 && !c.reduce) {
    const dirs = await page.evaluate(() => {
      const anchors = [...document.querySelectorAll("[data-torre-anchor]")].map((a) => ({ id: a.dataset.torreAnchor, cx: a.getBoundingClientRect().left + a.getBoundingClientRect().width / 2 }));
      return anchors.map((a, i) => {
        const anchor = document.querySelector(`[data-torre-anchor="${a.id}"]`);
        const text = anchor.closest("section").querySelector("[data-reveal][data-reveal-from]");
        return { id: a.id, torreDx: i === 0 ? 0 : a.cx - anchors[i - 1].cx, from: text?.dataset.revealFrom ?? "", hidden: anchor.hasAttribute("data-torre-hidden") };
      });
    });
    for (const d of dirs.slice(1)) {
      if (d.hidden || d.id === "assinatura" || !d.from) continue;
      // texto à direita (from=right) anda para a esquerda (dx < 0); à esquerda (from=left) anda para a direita (dx > 0)
      const textDx = d.from === "right" ? -1 : 1;
      check(Math.sign(d.torreDx) === textDx, `${d.id}: Torre ${d.torreDx < 0 ? "←" : "→"} (${Math.round(d.torreDx)}px) e texto ${textDx < 0 ? "←" : "→"} no mesmo sentido`);
    }
  }
  await context.close();
}
await browser.close();
console.log(failures ? `\n${failures} falha(s)` : "\nrevelação: tudo conforme");
process.exit(failures ? 1 : 0);
