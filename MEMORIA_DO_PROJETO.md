# Memória e decisões do projeto: Nexfort Capital

Última atualização: 08/11/2026.

> **Estado atual: projeto zerado.** Em 08/11/2026 o autor avaliou que o resultado ficou ruim no geral e pediu para limpar tudo. Todo o site foi removido e resta **uma página em branco**. A nova direção está em definição (seção 3).

> **DESCARTADO: a animação do touro e do urso se chocando.** A abertura em rolagem (`BrandPrologue`), em que os dois animais correm, colidem, explodem em luz e formam a Torre, **não será mais usada**. Não a recrie, não a adapte e não a sugira de novo, nem como variação.

---

## 1. Contexto do projeto

### Objetivo comercial
- O site é uma **proposta especulativa**. A ideia é vendê-lo à **Nexfort Capital Consultoria** (Sinop - MT).
- **A Nexfort ainda não sabe do projeto.** A estratégia é chegar com o produto pronto, funcionando, para chamar a atenção na primeira abordagem.
- Até a venda, a página **não é o site oficial** da empresa. Nome, endereço, telefone e perfis públicos da Nexfort entram só como conteúdo de demonstração.

### Como o projeto é feito
- **Tudo é gerado com IA:** o código, escrito pelo Claude Code, e os próprios prompts e briefings enviados a ele.
- O autor humano (Eduardo, conta `Edu4rdo-Gobatto`) dirige o projeto: define o objetivo, escolhe entre as opções propostas, aprova os planos e valida o resultado.
- As regras de engenharia que a IA deve seguir estão em `CLAUDE.md` e `AGENTS.md`. O guia da stack está em `ESTUDO_MOTION_STACK.md`.

---

## 2. Estado atual

| Item | Valor |
| --- | --- |
| Repositório | `github.com/Edu4rdo-Gobatto/nexfortcapital` (**público**) |
| Página | Em branco: `src/app/page.tsx` renderiza um `<main>` vazio |
| Código mantido | `src/app/layout.tsx` (só `lang="pt-BR"` e o título), `globals.css` (só `@import "tailwindcss"`), `next.config.ts` (sem os cabeçalhos de cache dos arquivos removidos) |
| Ativo mantido | `design/referencias/logo-nexfort-original.png`: logo original do cliente (1080 × 1080 px), fora do `public/`, então não é servido pelo site |
| Stack | Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript, Tailwind CSS 4. Motion 14, GSAP 3.15 e Lenis seguem instalados, sem uso |
| Build | `npm run build` e `npx eslint src --max-warnings=0` passando (08/11/2026) |
| Versão anterior | Inteira no histórico do Git. Último commit dela: `83bc42e`. Para recuperar um arquivo: `git show 83bc42e:<caminho>` |

### O que foi removido em 08/11/2026
- Todas as seções e componentes (`src/components/`), o conteúdo (`src/content/nexfort.ts`) e os utilitários (`src/lib/`).
- Ícone, imagens de Open Graph e Twitter, fontes, providers (Lenis, Motion, View Transitions) e dados estruturados (JSON-LD).
- `public/` inteiro: quadros da abertura, recortes da Torre e logo.
- `design/motion/`: vídeo do Google Flow, quadros de referência, scripts Python e o guia do Flow.

---

## 3. Nova direção (em definição): arte 3D do logo

**Ideia do autor:** uma arte 3D do logo da empresa como peça central do site. O "novo modelo a seguir" ainda não foi escolhido; o autor está buscando exemplos.

### O logo (matéria-prima)
- Torre de xadrez **azul-marinho**, chapada, com ameias no topo e base larga.
- No miolo da Torre, as silhuetas de um **urso e um touro** em degradê **amarelo → laranja → vermelho**.
- Abaixo, a marca **"NEXFORT CAPITAL"** em serifa clássica e a linha "FINANÇAS EMPRESARIAIS | FINANÇAS PESSOAIS | INVESTIMENTOS".
- **Limitação:** o arquivo veio de um JPEG pequeno (a Torre tem ~240 px de altura). Para modelar em 3D é preciso **redesenhar o logo em vetor** primeiro, fiel ao original.

### Referências e caminhos técnicos
_Em levantamento._

### Perguntas em aberto
- Qual referência vira o modelo a seguir?
- O que o 3D faz: gira sozinho, segue o cursor, reage à rolagem ou fica parado, só com luz?
- Material e clima: metal, vidro, pedra, cerâmica? Fundo escuro ou claro?
- O 3D é só da Torre ou inclui o urso e o touro em relevo dentro dela?

---

## 4. O que NÃO é mais modelo

| Item | Situação |
| --- | --- |
| **Abertura do touro × urso** (corrida, choque, explosão de luz, Torre nascendo da luz) | **Descartada de vez.** Não usar, não recriar, não sugerir. |
| Vídeo do Google Flow (Veo 3.1) e a sequência de quadros num canvas guiada pela rolagem | Removidos junto com a abertura. |
| Layout e seções da versão anterior (Hero com emblema e telemetria, Método Torre & Touro, Pilares, Simulador, Programas, Sede) | Removidos. Não servem de base para a nova versão. |
| Identidade "Fortaleza Financeira & Brutalismo Arquitetônico de Luxo" (concreto escuro, LED diagonal a 32°, cantos chanfrados, Cinzel + Plus Jakarta Sans + JetBrains Mono) | Não é mais referência obrigatória. Só volta se o autor pedir. |

**Continua valendo:** o logo do cliente deve aparecer **idêntico ao original** (formas e cores), mesmo quando reinterpretado em 3D.

---

## 5. Dados da empresa (nada foi confirmado com a Nexfort)

Coletados de perfis públicos para a versão anterior. Use só como demonstração e confirme antes de qualquer publicação.

| Item | Valor |
| --- | --- |
| Nome | Nexfort Capital Consultoria |
| Atuação | Finanças Empresariais, Finanças Pessoais e Investimentos |
| Slogan | "Organize, multiplique e tenha liberdade." |
| Endereço | Av. Das Artes, 253 - Aquarela das Artes, Sinop - MT, 78555-474 |
| Horário | Segunda a sexta, abre às 08:00 (horário de fechamento desconhecido) |
| Telefone / WhatsApp | (66) 99259-4858 |
| Instagram | `@nexfortcapital` |
| Programas | Imersão Torre Mestra (ITM), presencial (a página dizia "6 edições", não confirmado); Finance Pro, programa avançado |
| Sócios | Lucas Spinola (`@lucasspinolaconsultor`) e Gabriella Valadão (`@agabriella_valadao`); cargos não confirmados |

**Textos escritos pela IA, não oficiais:** a missão, as descrições dos pilares e dos programas e as premissas do simulador (poupança 6,17% a.a. e cenário hipotético de 12% a.a.). Se voltarem, precisam de validação.

---

## 6. Histórico

| Fase | Data | O que aconteceu |
| --- | --- | --- |
| 1 | 31/10/2026 | Landing completa (commit `05d0231`): 8 seções, simulador, emblema animado Torre + Touro, SEO e acessibilidade. Identidade "Fortaleza Financeira & Brutalismo". |
| 2 | 01/11/2026 | Limpeza de excessos (commit `5459be1`): saíram o card com inclinação 3D, o efeito magnético, o letreiro diagonal e a nota "5,0 ★ Google". Hover só em elementos clicáveis. Prancha antes × depois: https://claude.ai/artifact/P4pfTd4J6kWmjopokn9Usv (privada). |
| 3 | 02/11/2026 | Abertura em rolagem com o touro e o urso se chocando (vídeo do Google Flow em sequência de quadros) e logo original reconstruída em alta resolução (commit `83bc42e`). **Hoje descartada.** |
| 4 | 08/11/2026 | **Projeto zerado.** O autor achou o resultado ruim no geral e pediu para remover tudo, deixar uma página em branco e buscar um modelo novo, com a ideia de uma arte 3D do logo. |

---

## 7. Registro de decisões

| Data | Decisão | Motivo |
| --- | --- | --- |
| 31/10/2026 | Nada de cotações ou números de mercado inventados | Seriedade; não afirmar o que não podemos garantir. |
| 31/10/2026 | Qualquer simulação de rendimento é **hipotética** e leva aviso legal visível | Regras da CVM: sem promessa de retorno. |
| 01/11/2026 | Hover só em elementos clicáveis | Excesso de efeito parecia template de IA e tirava a seriedade. |
| 01/11/2026 | Sem nota "5,0 ★ Google" ou avaliações em nome do cliente | Afirmação não verificável; risco numa proposta não solicitada. |
| 02/11/2026 | Este arquivo e o `ESTUDO_MOTION_STACK.md` ficam versionados, com o repositório público | Decisão do autor: não há risco em expor o projeto. |
| 02/11/2026 | O logo do cliente aparece idêntico ao original | Pedido do autor. |
| 08/11/2026 | **Projeto zerado**: só uma página em branco | O autor achou o resultado ruim no geral. |
| 08/11/2026 | **A animação do touro e do urso se chocando está descartada** | Decisão do autor: não será mais usada. |
| 08/11/2026 | O logo original fica em `design/referencias/`, fora do `public/` | É a matéria-prima da arte 3D, mas não é servido pelo site em branco. |
| 08/11/2026 | Motion, GSAP e Lenis continuam no `package.json` | São a stack declarada no `CLAUDE.md`; sem uso, não entram no bundle. Revisar quando a nova direção estiver definida. |

---

## 8. Regras para continuar o projeto (para humanos e IAs)

- **Não use a animação do touro e do urso se chocando.** Nem como base, nem como variação.
- **Não reaproveite a versão anterior** como ponto de partida sem o autor pedir.
- **Motion:** siga o `CLAUDE.md` (só `transform` e `opacity`; molas `stiffness 300`, `damping 30`, `mass 1`; curva `cubic-bezier(0.22, 1, 0.36, 1)`; GSAP dentro de `useGSAP({ scope })`; imports de `motion/react`).
- **Conteúdo:** quando o site voltar a ter texto, centralize-o num arquivo só (como era `src/content/nexfort.ts`).
- **Commits:** a IA só commita ou dá push quando o autor pede.

---

## 9. Cuidados antes da abordagem

- **Demonstração online:** use uma URL de prévia (ex.: Vercel) **sem indexação** (`robots: noindex`, que ainda não existe no projeto) e, se possível, com senha. Não use domínio parecido com o da empresa.
- **Dados estruturados:** se voltar um JSON-LD que apresente o site como o negócio da Nexfort, não o deixe indexável antes da venda.
- **Domínio final:** defina `NEXT_PUBLIC_SITE_URL` no deploy oficial, para que as imagens de compartilhamento usem URL absoluta.
