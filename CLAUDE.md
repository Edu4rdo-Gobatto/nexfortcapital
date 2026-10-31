@AGENTS.md

# Diretrizes de Engenharia e Motion
- Stack: Next.js (App Router), TypeScript, Tailwind CSS v4, Motion (`motion/react`), GSAP (`@gsap/react`), Lenis (`lenis/react`), `next-view-transitions`.
- Performance: NUNCA anime `width`, `height`, `top`, `left` ou `margin`. Anime exclusivamente `transform` (`x`, `y`, `scale`, `rotate`) e `opacity`, ou use a prop `layout`/`layoutId` do Motion.
- GSAP: Sempre envolva animações GSAP e ScrollTrigger dentro do hook `useGSAP()` com `{ scope: containerRef }` para garantir cleanup automático.
- Física Padrão (Motion): Use `type: 'spring'`, `stiffness: 300`, `damping: 30`, `mass: 1`. Evite transições lineares sem física.
- Easing Padrão (GSAP/CSS): `power4.out` ou `cubic-bezier(0.22, 1, 0.36, 1)`.
- Imports: Sempre importe `motion` e hooks de `'motion/react'` (nunca de `'framer-motion'`).
