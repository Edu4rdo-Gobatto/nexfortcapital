# Guia Rápido da Stack de Interações

## 1. Quando usar cada ferramenta?
- **Motion (`motion/react`)**: Micro-interações de UI, hover, cliques, modais, `layoutId` (elementos que mudam de lugar na tela) e física de mola (`spring`).
- **GSAP + ScrollTrigger**: Timelines complexas atreladas ao scroll (`scrub`, `pin`), paralisação de seções e revelação de texto em sequência.
- **Lenis**: Smooth scroll de inércia conectado ao `gsap.ticker` para evitar trepidações no ScrollTrigger.
- **next-view-transitions**: Transições nativas de rota entre páginas usando o componente `<ViewTransitions>`.

## 2. Como pedir animações ao Claude Code
Use sempre a fórmula: **Gatilho + Propriedade + Física/Curva**.
- Exemplo: *'No hover do card (gatilho), aplique scale 1.04 na imagem e suba o título -6px (propriedade) usando spring stiffness 250, damping 25 com stagger de 0.04s (física).'*
