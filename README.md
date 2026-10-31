# Nexfort Capital: landing page

Landing page da **Nexfort Capital Consultoria** (Finanças Empresariais, Finanças Pessoais e Investimentos, Sinop - MT).
Conceito visual: *Fortaleza Financeira & Brutalismo Arquitetônico de Luxo*. Ele vem do concreto escuro da sede (Av. Das Artes, 253), da linha diagonal de LED da fachada (~32°) e do emblema Torre de xadrez + Touro.

## Stack

- **Next.js 16.4** (App Router, Turbopack, `cacheComponents`) + **React 19.3** + TypeScript estrito
- **Tailwind CSS 4.3** (tokens CSS-first em `src/app/globals.css`)
- **Motion 14** (`motion/react`): micro-interações, molas, `layoutId`, contadores
- **GSAP 3.15 + ScrollTrigger** (`@gsap/react`): pin e scrub do storytelling, marquee do ticker, parallax
- **Lenis 1.3** (`lenis/react`): scroll com inércia, dirigido pelo `gsap.ticker` e sincronizado ao ScrollTrigger
- **next-view-transitions**: transições nativas de rota

Regras de engenharia e motion: veja `CLAUDE.md`. Guia rápido da stack: `ESTUDO_MOTION_STACK.md`.

## Comandos

```bash
npm run dev     # desenvolvimento em http://localhost:3000
npm run build   # build de produção (valida TypeScript e prerender)
npm run start   # serve o build de produção
npm run lint    # ESLint (o build não roda lint)
```

## Onde editar

| O quê | Onde |
| --- | --- |
| **Textos, contatos, links, WhatsApp, programas, sócios, premissas do simulador** | `src/content/nexfort.ts` (fonte única) |
| Cores, fontes e utilitários (`led-line`, `clip-chamfer`, `concrete-noise`, `bg-bull-gradient`) | `src/app/globals.css` |
| Fontes (Cinzel, Plus Jakarta Sans, JetBrains Mono), metadados e SEO | `src/app/layout.tsx` |
| Ordem das seções e divisores | `src/app/page.tsx` |
| Geometria do emblema (Torre + Touro) | `src/components/brand/geometry.ts` |
| Física/curvas padrão do Motion | `src/lib/animations.ts` |
| Matemática do simulador | `src/lib/finance.ts` |
| Dados estruturados (schema.org) | `src/components/seo/JsonLd.tsx` |

## Estrutura

```
src/
  app/               layout (providers, fontes, metadata), page, globals.css, icon.svg
  content/           nexfort.ts: todo o conteúdo da página
  lib/               animations.ts, finance.ts, utils.ts (cn)
  components/
    providers/       MotionProvider (reduced motion global), SmoothScrollProvider (Lenis + GSAP)
    motion/          Magnetic, TextReveal, ParallaxBox, Reveal, RookBullCenterpiece (+ rook-bull/)
    brand/           NexfortLogo / NexfortEmblem + geometry.ts
    ui/              CtaLink (botão chanfrado), LedDivider, BrandIcons (WhatsApp, Instagram, Google)
    layout/          Navbar (+ menu mobile, scrollspy)
    sections/        Hero, MarketTicker, TowerAndBullStory, PillarsBentoGrid,
                     WealthSimulator, ProgramsAndFounders, HeadquartersFooter
    seo/             JsonLd
```

## Antes de publicar (validar com a Nexfort)

- **Premissas do simulador** (`SIMULATOR` em `nexfort.ts`): a poupança usa 6,17% a.a. e o cenário Nexfort, **12% a.a. hipotético**. O aviso legal é exibido junto ao gráfico. Confirme os números e o texto com a equipe (regras da CVM: sem promessa de retorno).
- **Próxima edição da ITM**: a linha do tempo mostra um marcador "Próxima edição". Confirme que há uma nova edição prevista.
- **Missão**: a frase em `BRAND.mission` é atribuída à empresa, não aos sócios. Valide o texto.
- **Fotos dos sócios**: hoje os sócios aparecem com monogramas. Se houver fotos, podem substituí-los.
- **Domínio**: defina a variável de ambiente `NEXT_PUBLIC_SITE_URL` (ex.: `https://www.seudominio.com.br`) para que a imagem de compartilhamento (`src/app/opengraph-image.jpg`, 62 KB, prévia de link no WhatsApp e redes) seja servida com URL absoluta. Na Vercel isso é automático.
- **Avaliações no Google**: se houver o link das avaliações, o selo "5,0 no Google" pode virar um link.

## Acessibilidade e performance

- `prefers-reduced-motion` é respeitado em todas as camadas: Motion (global), GSAP (`gsap.matchMedia`), Lenis (`respectReducedMotion`) e CSS (`motion-safe:`).
- O conteúdo animado tem texto acessível (`sr-only`). O ticker tem botão de pausa (WCAG 2.2.2) e o menu mobile prende o foco.
- As animações usam apenas `transform`/`opacity` (e `pathLength` para desenho de linhas). Laços infinitos pausam fora da tela.

## Observação sobre OneDrive

O projeto está dentro do OneDrive. A sincronização de `node_modules` e `.next` deixa o OneDrive lento e pode causar erros `EPERM`/`EBUSY` no Windows. Se isso acontecer, mova o projeto para fora do OneDrive (ex.: `C:\dev\nexfortcapital`) ou pause a sincronização durante o desenvolvimento.
