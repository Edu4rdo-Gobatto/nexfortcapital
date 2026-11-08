# Nexfort Capital: landing page

Proposta de site para a **Nexfort Capital Consultoria** (Finanças Empresariais, Finanças Pessoais e Investimentos, Sinop - MT).

## Estado atual: projeto zerado

Em 08/11/2026 a versão anterior do site foi removida por completo. Hoje o projeto é **uma página em branco**. A nova direção visual está em definição: a ideia em estudo é uma **arte 3D do logo da empresa**.

> **Descartado:** a abertura em que o touro e o urso correm e se chocam. Ela não será usada nem retomada.

Contexto, decisões, referências e próximos passos: **`MEMORIA_DO_PROJETO.md`**.

## O que ficou no repositório

| Caminho | O quê |
| --- | --- |
| `src/app/` | `layout.tsx`, `page.tsx` (vazia) e `globals.css` (só o import do Tailwind) |
| `design/referencias/logo-nexfort-original.png` | Logo original do cliente, 1080 px: matéria-prima da arte 3D. Não é servido pelo site |
| `MEMORIA_DO_PROJETO.md` | Memória do projeto: contexto, histórico, decisões e nova direção |
| `CLAUDE.md` / `AGENTS.md` | Regras de engenharia e motion para a IA |
| `ESTUDO_MOTION_STACK.md` | Guia rápido de quando usar cada biblioteca de animação |
| `.agents/`, `.claude/` | Skills instaladas para a IA (`frontend-design`, `vercel-react-best-practices`) |

A versão anterior inteira continua no histórico do Git (último commit dela: `83bc42e`). Para recuperar um arquivo: `git show 83bc42e:<caminho>`.

## Stack

- **Next.js 16.4** (App Router, Turbopack, `cacheComponents`) + **React 19.3** + TypeScript estrito
- **Tailwind CSS 4**
- Instaladas e ainda sem uso: **Motion 14** (`motion/react`), **GSAP 3.15** (`@gsap/react`), **Lenis**, **next-view-transitions**

## Comandos

```bash
npm run dev     # desenvolvimento em http://localhost:3000
npm run build   # build de produção (valida TypeScript e prerender)
npm run start   # serve o build de produção
npm run lint    # ESLint (o build não roda lint)
```

## Observação sobre OneDrive

O projeto está dentro do OneDrive. A sincronização de `node_modules` e `.next` deixa o OneDrive lento e pode causar erros `EPERM`/`EBUSY` no Windows. Se isso acontecer, mova o projeto para fora do OneDrive (ex.: `C:\dev\nexfortcapital`) ou pause a sincronização durante o desenvolvimento.
