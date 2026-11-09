@AGENTS.md

# Estado do projeto (leia antes de propor qualquer coisa)
- O site foi zerado em 08/11/2026 e está sendo reconstruído na direção **"Uma volta na Torre"**: a Torre do logo em 3D, girando só com a rolagem. Hoje existe a fatia de prova (hero, um bloco e a assinatura). Contexto, decisões e próximos passos estão em `MEMORIA_DO_PROJETO.md`; a próxima etapa está especificada em `PROMPT_FASE_3.md`.
- **Descartado: a animação do touro e do urso correndo e se chocando** (abertura em rolagem / vídeo do Google Flow). Não a use, não a recrie e não a sugira.
- Nada da versão anterior (layout, seções, identidade visual) é modelo a seguir.
- A Torre 3D, o emblema e o nome vêm do logo original (`design/referencias/logo-nexfort-original.png`) via `design/torre/extract_torre.py`. Os arquivos gerados (`geometry.ts`, `miolo.ts`, `marks.ts`, `icon.svg`) não se editam à mão.

# Diretrizes de Engenharia e Motion
- Stack: Next.js (App Router), TypeScript, Tailwind CSS v4, Motion (`motion/react`), GSAP (`@gsap/react`), Lenis (`lenis/react`), `next-view-transitions`.
- Performance: NUNCA anime `width`, `height`, `top`, `left` ou `margin`. Anime exclusivamente `transform` (`x`, `y`, `scale`, `rotate`) e `opacity`, ou use a prop `layout`/`layoutId` do Motion.
- GSAP: Sempre envolva animações GSAP e ScrollTrigger dentro do hook `useGSAP()` com `{ scope: containerRef }` para garantir cleanup automático.
- Física Padrão (Motion): Use `type: 'spring'`, `stiffness: 300`, `damping: 30`, `mass: 1`. Evite transições lineares sem física.
- Easing Padrão (GSAP/CSS): `power4.out` ou `cubic-bezier(0.22, 1, 0.36, 1)`.
- Imports: Sempre importe `motion` e hooks de `'motion/react'` (nunca de `'framer-motion'`).
