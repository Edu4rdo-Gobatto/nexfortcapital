# Nexfort Capital: landing page

Proposta de site para a **Nexfort Capital Consultoria** (Finanças Empresariais, Finanças Pessoais e Investimentos, Sinop - MT).

## Estado atual: "Uma volta na Torre", fatia de prova

O site foi zerado em 08/11/2026 e está sendo reconstruído com uma ideia central: **a Torre do logo em 3D**, que gira só com a rolagem (uma volta completa na página) e termina de frente, formando o logo com o nome. Hoje existe a fatia de prova: hero, um bloco imagem/texto e a assinatura com contato. Ela aguarda aprovação antes dos demais blocos.

> **Descartado:** a abertura em que o touro e o urso correm e se chocam. Ela não será usada nem retomada.

Contexto, decisões, referências e próximos passos: **`MEMORIA_DO_PROJETO.md`**.

## Mapa do repositório

| Caminho | O quê |
| --- | --- |
| `src/app/` | `layout.tsx` (fontes, metadados, `noindex`), `page.tsx` (a página), `globals.css` (tokens, tipografia, revelação), `icon.svg` (gerado) |
| `src/components/torre/` | A Torre 3D: palco fixo, cena (R3F), geometria, coreografia da rolagem e os dados gerados do logo |
| `src/components/sections/` | Hero, bloco imagem/texto, assinatura, revelação do texto, âncoras da Torre, cabeçalho e rodapé |
| `src/components/brand/` | Emblema e nome "NEXFORT CAPITAL" em SVG, traçados do logo |
| `src/content/nexfort.ts` | Todo o texto do site, com a origem de cada trecho (perfis públicos ou rascunho a validar) |
| `design/torre/extract_torre.py` | Extrai do logo original o perfil da Torre, as ameias, o urso e o touro, o emblema, o nome e o favicon |
| `design/referencias/logo-nexfort-original.png` | Logo original do cliente, 1080 px: matéria-prima do script acima. Não é servido pelo site |
| `MEMORIA_DO_PROJETO.md` | Memória do projeto: contexto, histórico, decisões e direção |
| `CLAUDE.md` / `AGENTS.md` | Regras de engenharia e motion para a IA |
| `ESTUDO_MOTION_STACK.md` | Guia rápido de quando usar cada biblioteca de animação |
| `.agents/`, `.claude/` | Skills instaladas para a IA (`frontend-design`, `vercel-react-best-practices`) |

A versão anterior inteira continua no histórico do Git (último commit dela: `83bc42e`). Para recuperar um arquivo: `git show 83bc42e:<caminho>`.

## Stack

- **Next.js 16.4** (App Router, Turbopack, `cacheComponents`) + **React 19.3** + TypeScript estrito
- **Tailwind CSS 4**
- **three 0.187** + **@react-three/fiber 9.8** (a Torre 3D, carregada sob demanda)
- **GSAP 3.15** (`@gsap/react`, ScrollTrigger, SplitText) + **Lenis** (rolagem com inércia)
- Instaladas e ainda sem uso: **Motion 14** (`motion/react`), **next-view-transitions**

Para regenerar os dados do logo: `python design/torre/extract_torre.py` (requer `numpy` e `Pillow`; `--check PASTA` grava imagens de conferência).

## Comandos

```bash
npm run dev     # desenvolvimento em http://localhost:3000
npm run build   # build de produção (valida TypeScript e prerender)
npm run start   # serve o build de produção
npm run lint    # ESLint (o build não roda lint)
```

## Observação sobre OneDrive

O projeto está dentro do OneDrive. A sincronização de `node_modules` e `.next` deixa o OneDrive lento e pode causar erros `EPERM`/`EBUSY` no Windows. Se isso acontecer, mova o projeto para fora do OneDrive (ex.: `C:\dev\nexfortcapital`) ou pause a sincronização durante o desenvolvimento.
