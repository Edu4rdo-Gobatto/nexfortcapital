# Memória e decisões do projeto: Nexfort Capital

Última atualização: 09/11/2026.

> **Estado atual: Fase 3 executada (09/11/2026).** A direção é **"Uma volta na Torre"** (seção 3), com a Torre do logo em 3D. A página tem o hero, seis blocos imagem/texto e a assinatura; os quatro ajustes do autor sobre a fatia de prova foram feitos (seção 3.1) e as decisões de marca estão na prancha `design/prancha/index.html`. Falta a Fase 4 (acabamento) e a revisão final do movimento pelo autor (`/review-animations`).

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
| Página | **Fase 3**: hero, seis blocos imagem/texto (Finanças Empresariais, Finanças Pessoais, Investimentos, Como trabalhamos, Programas, Sócios) e a assinatura com contato. Parte do commit `a61a738` (fatia de prova, aprovada no geral); a Fase 3 está no working tree, sem commit |
| Código | `src/components/torre/` (palco, cena, Torre, coreografia e dados gerados), `src/components/sections/` (Hero, SplitBlock, Signature, Reveal, TorreAnchor, Chrome), `src/components/brand/` (emblema e nome em SVG), `src/components/providers/SmoothScroll.tsx`, `src/content/nexfort.ts` (todo o texto), `src/lib/` (`cn`, registro do GSAP) |
| Ativo | `design/referencias/logo-nexfort-original.png`: logo original (1080 × 1080 px), matéria-prima de `design/torre/extract_torre.py`, que gera a geometria, o miolo, o emblema, o nome e o favicon (`src/app/icon.svg`) |
| Stack | Next.js 16.4 (App Router, Turbopack, Cache Components), React 19.3, TypeScript, Tailwind CSS 4, GSAP 3.15 (ScrollTrigger, SplitText), Lenis, three 0.187, @react-three/fiber 9.8. Motion e next-view-transitions seguem instalados, sem uso |
| Fontes | Newsreader (títulos, com eixo óptico) + Hanken Grotesk (texto), via `next/font`. **Confirmadas** na prancha da Fase 3 (alternativa registrada: Source Serif 4 + IBM Plex Sans) |
| Prévia | `robots: noindex` já no `layout.tsx` (seção 9) |
| Build | `npm run build`, `npx tsc --noEmit` e `npx eslint src --max-warnings=0` passando (09/11/2026) |
| Prancha e QA | `design/prancha/index.html` (decisões de paleta, miolo e tipografia, com capturas reais; uso interno, não publicar) e `design/qa/` (roteiros de verificação com Playwright; `README.md` lá) |
| Versão anterior | Inteira no histórico do Git. Último commit dela: `83bc42e`. Para recuperar um arquivo: `git show 83bc42e:<caminho>` |

### O que foi removido em 08/11/2026
- Todas as seções e componentes (`src/components/`), o conteúdo (`src/content/nexfort.ts`) e os utilitários (`src/lib/`).
- Ícone, imagens de Open Graph e Twitter, fontes, providers (Lenis, Motion, View Transitions) e dados estruturados (JSON-LD).
- `public/` inteiro: quadros da abertura, recortes da Torre e logo.
- `design/motion/`: vídeo do Google Flow, quadros de referência, scripts Python e o guia do Flow.

---

## 3. Nova direção (definida em 08/11/2026): "Uma volta na Torre"

### Decisões do autor
1. A Torre do logo em 3D, **girando só com a rolagem** e terminando de frente (= o logo). Nada de rotação perpétua. *(Desde o feedback de 08/11: gira por descanso, ~3 voltas, sempre mostrando o desenho; ver a tabela de feedback.)*
2. Fundo **claro**. Nada de preto com dourado, a estética do guru de day-trade. *(Desde o feedback de 08/11: neutro tingido análogo ao marinho, definido pela paleta da Fase 3.)*
3. Blocos com **imagem de um lado e texto do outro**, alternando. A imagem é a própria Torre 3D, num ângulo por bloco; no bloco dos sócios, retratos.
4. **Rolagem livre:** cada bloco se revela com transição suave ao entrar na tela. Nada prende a rolagem.
5. **Todo bloco tem texto de verdade.** A Torre é a imagem, nunca o conteúdo.

### Coreografia
- **Chegada** (no carregamento, uma vez): a luz de estúdio acende sobre a Torre, que termina de girar até a pose 3/4. Depois, imóvel.
- **Blocos:** a Torre viaja para o lado da imagem de cada bloco e avança uma etapa da volta. A travessia acontece no respiro entre blocos, nunca por trás do texto.
- **Revelação do texto:** rótulo → título linha a linha → parágrafo → itens → link; opacidade + `y`, `power4.out`, uma vez.
- **Sócios:** o único momento em que a Torre sai de cena.
- **Assinatura:** a Torre fecha a volta de frente e o nome surge embaixo, junto do contato.
- **Menos movimento:** Torre parada e texto só com opacidade. **Sem WebGL:** imagem estática.

### Mapa de conteúdo
| # | Bloco | Texto | Origem |
| --- | --- | --- | --- |
| 0 | Hero | "Organize, multiplique e tenha liberdade." + as três frentes + "Agendar uma conversa" | Perfis públicos |
| 1 | Finanças Empresariais | Fluxo de caixa; custos, margem e preço; planejamento | Rascunho da IA |
| 2 | Finanças Pessoais | Orçamento; saída de dívidas; reserva e metas | Rascunho da IA |
| 3 | Investimentos | Perfil; estratégia; acompanhamento. Sem promessa de retorno | Rascunho; confirmar registro (CVM/ANCORD/CFP) |
| 4 | Como trabalhamos | Os 3 verbos do slogan como etapas | Verbos reais; descrições são rascunho |
| 5 | Programas | Imersão Torre Mestra e Finance Pro | Nomes reais; descrições não confirmadas |
| 6 | Sócios | Lucas Spinola e Gabriella Valadão (retratos provisórios) | Perfis públicos |
| 7 | Assinatura e contato | Fechamento, WhatsApp, endereço, horário, Instagram | Perfis públicos |

### O logo em vetor (Fase 1, feita)
- `design/torre/extract_torre.py` extrai do logo original:
  - o **perfil de revolução** da Torre (`src/components/torre/geometry.ts`);
  - as **ameias** (`geometry.ts`);
  - o **urso e o touro** com o degradê medido (`src/components/torre/miolo.ts`);
  - o **emblema 2D e o nome "NEXFORT CAPITAL"** em SVG (`src/components/brand/marks.ts`).
- Os arquivos `.ts` são gerados: para mudar, ajuste o script e rode de novo.
- Conferência: a silhueta frontal do 3D bate com o original (IoU 0,978; a diferença é o antisserrilhado da borda).
- O nome é **traçado do bitmap**: nenhuma fonte de sistema reproduz o desenho (a melhor fica em IoU 0,58).
- As ameias do logo têm larguras iguais no desenho 2D. No 3D ficam em volta do eixo, com ângulos `asin(x/R)` medidos e espelhados atrás: de frente, a silhueta é a do logo.
- A base do logo é desenhada curva. O 3D reproduz isso com um fundo levemente abaulado, invisível de cima.

### Fases
1. Torre em vetor: **feita**.
2. Fatia de prova (hero + Finanças Empresariais + assinatura): **aprovada no geral pelo autor em 08/11/2026** (commit `a61a738`, "NEXFORT 2.0"), com os ajustes abaixo.
3. Blocos, conteúdo e os ajustes da fatia (`PROMPT_FASE_3.md`): **feita em 09/11/2026**, em modo auto. O que foi feito, decidido e medido está na seção 3.1; as pendências, na seção 10.
4. Acabamento (acessibilidade, Lighthouse, teste num Android real): a fazer.

### Feedback do autor sobre a fatia (08/11/2026) e decisões
Onde este feedback conflita com as decisões e a coreografia acima, **vale o feedback**.


| # | Pedido do autor | Decisão |
| --- | --- | --- |
| 1 | O urso e o touro estão "muito tortos"; quer linhas mais retas | Redesenho limpo do miolo: retas onde a forma é reta, curva só onde é curva (chifre). **O autor autorizou alterar de leve o desenho do logo** para isso. Pontos curados ficam em `design/torre/miolo-redesenho.json` |
| 2 | No 2º descanso a Torre mostra só o azul; "apenas a Torre é simples demais" | **Desenho nas duas faces** (verso espelhado, lê certo de trás). A Torre sempre descansa com o desenho virado para o texto. O giro passa a ser por descanso (~3 voltas na página, sempre só com a rolagem) e termina de frente |
| 3 | Informações aparecendo com transição suave e horizontal, pelo lado do texto | **Desktop (≥ 1024 px):** o texto entra do lado em que está (à direita, da direita para a esquerda; à esquerda, o inverso). **Celular:** vertical, por análise do autor e do designer: abaixo de 1024 px a cena só anda na vertical, e um deslizamento lateral ali seria movimento sem motivo |
| 4 | Paleta pela teoria das cores: destaque no lado oposto do círculo, fundo a ~30° da principal | 60-30-10. Principal: marinho `#0C035B` (h 270,9°). Destaque: o âmbar do logo `#FBAE14` (a 165° do marinho, já é o complementar da marca), em CTAs e marcadores, nunca como texto sobre fundo claro. Fundo: neutro tingido análogo ao marinho, `#F6F5F9` recomendado (a porcelana atual `#F3F1EC` é tingida para o lado do destaque) |

### Como a fatia foi construída (para quem continuar)
- **Torre 3D procedural**: corpo de revolução com o perfil redesenhado sobre a medida (trechos lisos: retas, polinômios de grau baixo; resíduo ≤ 0,41 px) e 8 ameias. O urso e o touro são uma textura projetada de frente, então a vista frontal fica idêntica ao logo. **Um material só** (`MeshPhysicalMaterial` com verniz): a metade de trás e as ameias apontam o UV para uma área azul-marinho da textura.
- **Estúdio**: luzes retangulares viram mapa de ambiente (PMREM 512). Os shaders do PMREM e da Torre compilam **em paralelo** antes do primeiro quadro (o canvas nasce em `frameloop="never"`), e só então começa a Chegada.
- **Coreografia** (`choreography.ts`): âncoras no layout; a Torre descansa centralizada em cada seção (no celular, nunca cortada no topo), viaja com `power3.inOut`, recua 40% no meio da travessia (desktop) ou esmaece (celular). Depois do último descanso, acompanha a página. Com "menos movimento", some no meio do caminho e reaparece no lugar, sem giro. *(O giro linear da fatia foi substituído na Fase 3: ver 3.1.)*
- **Revelação**: o GSAP só decide quando (ScrollTrigger, uma vez) e divide o título em linhas (SplitText com máscara). O movimento é transição CSS (compositor). O texto só nasce escondido com JS ativo; se o app não confirmar em 4 s, tudo aparece.
- **Sombra**: degradê radial pré-calculado sob a base (sem passe extra de render).
- **Medido** (Chrome com GPU, 1440×900): **0 chamadas de desenho com a página parada**; ~400 durante 1,7 s de rolagem. Maior tarefa longa do carregamento: ~200 ms (antes das correções era 1,6 s, por compilação síncrona de shaders).
- **Reservas**: sem WebGL ou sem JavaScript, o emblema 2D do logo aparece em cada âncora e todo o texto fica legível.
- **Aviso conhecido**: `THREE.Clock` obsoleto no console vem de dentro do R3F 9.8, não do nosso código.

Skills previstas: `/animate`, `/animation-performance`, `/frontend-design`, `/landing-page-design`, `/design-taste-frontend`, `/ui-ux-pro-max`, `/web-design-guidelines` e `/review-animations`. Esta última só o autor dispara (`disable-model-invocation: true`). A lista completa, por etapa, está no `PROMPT_FASE_3.md`.

### 3.1 Fase 3: o que foi feito (09/11/2026)
Os quatro pedidos do feedback acima, mais os blocos 02 a 06. Tudo foi medido num Chrome com GPU (AMD Radeon, ANGLE/D3D11) sobre o build de produção.

**Paleta (60-30-10, pelo círculo de cores).** Tokens do `@theme` em `globals.css`:

| Papel | Token | Cor | OKLCH | Uso |
| --- | --- | --- | --- | --- |
| Fundo (60%) | `--color-paper` | `#F6F5F9` | 0,972 · 0,005 · 297,7° (a 26,9° do marinho) | fundo da página e do 3D |
| Principal (30%) | `--color-navy` | `#0C035B` | 0,224 · 0,140 · 270,9° | a Torre, os títulos, o rodapé |
| Destaque (10%) | `--color-amber` | `#FBAE14` | 0,805 · 0,166 · 76,2° (a 165,3° do marinho) | botão principal (texto marinho, 9,47:1), filetes e marcadores. **Nunca texto sobre fundo claro (1,73:1)** |
| Texto | `--color-ink`, `--color-ink-soft` | `#14122B`, `#4D4B63` | | 16,81:1 e 7,73:1 sobre o fundo (AAA) |

Alternativas registradas: fundo `#F2F6F9` (−30°, mais frio) e o porcelana antigo `#F3F1EC` (a 177,8° do marinho: tingido para o lado do destaque, é o que a regra corrige). O nome e a linha de áreas do logo ficam na tinta (o logo é preto no original). A luz de chão do estúdio 3D (`studioScene`), o `themeColor` e o favicon (`ICON_BG` em `extract_torre.py`) usam o mesmo fundo. **Medido nas 8 telas de descanso (1440×900): 86% fundo, 8,5% marinho, 2,5% quente, 3% tinta e cinzas.** Numa página clara e arejada o fundo passa de 60% em área, então a regra vale como papel de cada cor, não como área.

**Miolo (urso e touro).** Redesenho autorizado pelo autor, com linhas mais retas. `design/torre/curar_miolo.py` guarda os pontos-chave (orelha, focinho, queixo, divisa urso/touro, chifre, linha do pescoço, mancha vermelha da base, nomeados, em px do recorte da Torre) e grava `design/torre/miolo-redesenho.json`; `extract_torre.py` usa o JSON (campo `escolhida`, ou `--variante A|B|original`) e gera o mesmo desenho no 3D (`miolo.ts`), no emblema 2D (`marks.ts`, recortado pela silhueta com `clip-path`) e no favicon. Variantes: **A (escolhida)**, reta onde a forma é reta e curva só na orelha, testa, divisa, chifre e mancha da base (desvio máximo 1,51 px do traçado original, p95 0,68 px, IoU 0,971, 1,9 KB contra 6,7 KB); **B**, facetada, só retas (1,60 px, IoU 0,962); e o traçado original. A borda direita e a base do miolo passam 3 px para fora da silhueta de propósito: o emblema 2D e o favicon recortam pela silhueta (`clip-path`) e não deixam fresta azul; no 3D o limbo esmaece de qualquer jeito. A ponta do chifre sobe ~1,4 px além do traçado, onde o logo tem um fio de 1 px que o traçado cortava.

**Torre de duas faces.** O verso usa a mesma textura e o mesmo material, com UV planar espelhado (`u = (−x − x0) / (x1 − x0)`): de trás o desenho lê como o logo. Cada âncora declara `data-torre-face` e `data-torre-facing`; a Torre descansa 35° virada para o lado do texto e o giro só avança:

| Descanso | Torre | Face → texto | θ |
| --- | --- | --- | --- |
| Hero | direita | frente → esquerda | −35° |
| 01 Empresariais | esquerda | verso → direita | 215° |
| 02 Pessoais | direita | frente → esquerda | 325° |
| 03 Investimentos | esquerda | verso → direita | 575° |
| 04 Como trabalhamos | direita | frente → esquerda | 685° |
| 05 Programas | esquerda | verso → direita | 935° |
| 06 Sócios | fora de cena (opacidade 0, recua 50%) | frente → esquerda | 1045° |
| Assinatura | centro | de frente | 1080° |

O giro entre descansos usa a mesma curva da viagem (`power3.inOut`). **Emenda lateral:** com o verso espelhado, em 90° e 270° o lado quente de uma face encosta no azul da outra; o miolo esmaece para azul-marinho nos últimos 6% do raio, linha a linha (`LIMB_FADE` em `Torre.tsx`). Sem isso a costura corta a Torre ao meio; com isso vira uma faixa azul fina (prancha, quadro 3). Efeito conhecido: nos descansos de verso (01, 03, 05) uma fatia fina do desenho da outra face aparece na borda da silhueta, como se o desenho desse a volta no corpo. O descanso de fora de cena é um descanso como os outros (opacidade 0): o giro dele é desenrolado na mesma regra, e a Torre segue girando enquanto esmaece. **Salto de rolagem** (âncora do cabeçalho, arrasto da barra): o giro atual troca pelo equivalente mais próximo do alvo (a Torre é idêntica a cada 360°), então ela não gira ~3 voltas em meio segundo; só o salto do *alvo* dispara isso (`writeTarget`), nunca o atraso do amortecimento. **Menos movimento:** o rig fica em modo instantâneo (`setInstant`): a pose troca de uma vez, com a Torre esmaecida, no ângulo do próximo descanso. O app grava o descanso medido de cada âncora em `data-torre-rest`, e os roteiros de QA leem dali (`design/qa/lib.mjs`).

**Revelação.** Desktop (≥ 64rem = 1024 px, o `lg` do Tailwind, em rem nos três lugares: CSS, `matchMedia` e classes): o texto entra do lado em que está (`translateX(±48px) → 0`), no mesmo sentido em que a Torre chega (câmera panorâmica); abaixo disso, sobe (`translateY(24px) → 0`). Hero: keyframes CSS, sem JavaScript. Títulos linha a linha, **sem máscara** (com máscara, a linha vinda da esquerda mostraria o fim da frase primeiro). Contato: título à esquerda e dados à direita, em sentidos opostos. Uma transição só: 900 ms, `cubic-bezier(0.22, 1, 0.36, 1)`, 80 ms entre itens, só `transform` e `opacity`, com os números nos tokens `--enter-*` de `:root` (hero e blocos leem os mesmos); `overflow-x: clip` nas seções; com "menos movimento", só opacidade (500 ms). O GSAP só decide *quando* (ScrollTrigger, uma vez); o movimento é transição CSS no compositor.

**Blocos 02 a 06.** Um componente só (`SplitBlock`), com variações por dados (`kind` em `nexfort.ts`): itens (01, 02, 03), etapas numeradas (04, Organize, Multiplique, Tenha liberdade), programas (05, Imersão Torre Mestra e Finance Pro; "6 edições" não foi usado) e sócios (06, retratos provisórios em iniciais sobre o neutro tingido, cargos e biografias "a confirmar", sem foto). Investimentos não promete retorno ("Todo investimento envolve risco. Não prometemos rentabilidade.") e não fala em recomendação. Cada bloco tem a sua mensagem de WhatsApp. Rodapé marinho. Proporção 7/5 alternada, 120svh no desktop.

**Acessibilidade e toque.** Skip link, `touch-action: manipulation`, realce de toque intencional, área de toque dos links de ~44 px, botões principais em largura total no celular, telefone sem quebra, foco âmbar sobre o rodapé marinho.

**Medições (build de produção, 1440×900).**

| O quê | Resultado |
| --- | --- |
| Chamadas de desenho com a página parada | **0** (e 0 de novo depois de rolar) |
| A roda do mouse move a página (Lenis) | sim (scrollY 0 → 1185 em 2 s; 468 a 484 chamadas de desenho enquanto rola) |
| Maior tarefa longa depois do carregamento | 133 a 138 ms (4 execuções) |
| `torre: estúdio (PMREM)` / `torre: compilação dos shaders` | 360 a 395 ms / 267 a 309 ms |
| Torre inteira e fora do texto em todos os descansos | 7 de 7, no desktop e no celular |
| Revelação (`design/qa/revelacao.mjs`) | conforme em 4 configurações (1440, 820, 390 e menos movimento), sem barra horizontal; Torre e texto no mesmo sentido nos 5 blocos em que ela cruza a tela |
| Sem JavaScript / sem WebGL | emblema 2D nas 7 âncoras; texto legível |
| Vídeos da rolagem real | `design/qa/saida/videos/` (desktop 31 s, celular 28 s); WebGL presente nos quadros |

**Revisões feitas antes da entrega.** `/code-review` (nível `high`): 8 achados; aplicados 6 (giro de salto só no alvo, pose travada com "menos movimento", poses iguais não ganham volta, anéis do esmaecimento construídos uma vez, JSON lido uma vez, `parse_path` robusto); mantidos 2 de propósito ("Cargo a confirmar" visível em Sócios, pedido do prompt; área de toque dos links). `/simplify` (4 revisores em paralelo: reuso, simplificação, eficiência, altitude): aplicados o `ExternalLink` único, o `overflow-x: clip` único na `<main>`, os tokens `--enter-*` do movimento de entrada (uma fonte só para 24 px, 48 px, 900 ms e 80 ms), o ponto de quebra em `64rem` igual ao do Tailwind (CSS e `matchMedia`), o "fora de cena" como propriedade de primeira classe (`torre.hidden`), "menos movimento" como modo do rig, o `lib.mjs` e o `data-torre-rest` no QA, `load_logo`/`warm_trace`/`silhouette_trace`/`bezier`/`signed_area` comuns ao extrator e ao curador, o gabarito único do emblema SVG (que também corrigiu `fill-rule` onde era `clip-rule`), o curador preservando a variante `escolhida`, o desenho do nome e da silhueta definido uma vez em `<symbol>`/`<use>` (o documento caiu de 156 KB para 114 KB) e os títulos divididos pelo SplitText só quando a coluna está a uma tela de entrar (menos leitura de layout na hidratação). Auditoria de movimento: sem `ease-in`, `scale(0)`, `transition: all` nem animação de propriedade de layout; a duração do hero passou de 1000 para 900 ms (uma transição só). Verificador da `design-taste-frontend` em dois passes (1440, 820 e 390 px): 50 falhas no desktop no primeiro (68 somando as telas menores) e 48 (66) no segundo, depois das correções. O que sobra é premissa do kit dele em conflito com decisão do autor, e a do autor vale: `no-visual` (24; não reconhece a Torre fixa como o visual das seções), `effect-kind` e `effects-fit` (3D fora de tecnologia), `section-*`, `one-section`, `split-pair` e `container-edges` (120svh por bloco, texto centralizado na altura, margem de 56 px), `copy-headline`, `copy-headings` e `copy-fact` (o slogan é o h1), `street-number` e `phone-number` (dados públicos reais da empresa) e `shader-lint` (falso positivo: o `#include <common>` interno do three.js). Os pontos legítimos foram corrigidos e confirmados no segundo passe (`fold-cut` e `row-lines` foram a 0): botão do hero fora da dobra no celular, fotos dos sócios fora das linhas da grade, e a mesma ação com palavras diferentes no cabeçalho, no hero e no fecho ("Agendar uma conversa" nos três).

### O logo (matéria-prima)
- Torre de xadrez **azul-marinho**, chapada, com ameias no topo e base larga.
- No miolo da Torre, as silhuetas de um **urso e um touro** em degradê **amarelo → laranja → vermelho**.
- Abaixo, a marca **"NEXFORT CAPITAL"** em serifa clássica e a linha "FINANÇAS EMPRESARIAIS | FINANÇAS PESSOAIS | INVESTIMENTOS".
- **Limitação:** o arquivo veio de um JPEG pequeno (a Torre tem ~240 px de altura). Para modelar em 3D é preciso **redesenhar o logo em vetor** primeiro, fiel ao original.

### Referências (sites no ar e conferidos em 08/11/2026)

**Empresas de finanças e investimentos (as mais próximas):**

| Site | O que o 3D faz | Técnica |
| --- | --- | --- |
| [Penguin Capital](https://www.penguin-capital.co.jp) | O próprio logo em cromo 3D, sob um título serifado enorme, em fundo grafite. **É a referência mais próxima:** gestora de ativos, emblema virando escultura e marca serifada | React Three Fiber + modelo GLB |
| [Republic Note](https://republic.com/note) | O "R" do logo em cristal transparente, girando atrás do título, em fundo claro | Vídeo pré-renderizado em loop, sem WebGL |
| [Letter](https://letter.co/) | Escultura de cristal girando no preto, para clientes de alta renda. [O estudo de caso](https://unseen.co/projects/letter/) explica por que escolheram vídeo pré-renderizado em vez de 3D ao vivo | Sequência de imagens guiada pela rolagem + WebGL |
| [Risk Solved](https://www.risksolved.com/) | As peças do logo montam-se e giram em grafite e laranja-avermelhado: duas cores perto do azul-marinho com laranja da Nexfort | Vídeo renderizado no Blender |
| [Hashgraph Ventures](https://hashgraphvc.com/) | Um monólito de pedra rachada com veios de luz sobre um oceano azul-marinho. Clima de "fortaleza" | three.js |
| [KAIB Invest](https://kaib-invest.com/) | Um laço de cromo escovado que ecoa o logo, em fundo branco. Um vídeo por tamanho de tela | Vídeos renderizados no Blender |
| [Maxima Finance](https://maximafinance.co.uk/) | Estátua e busto de pedra clássicos; o busto gira quando arrastado | `<model-viewer>` |

**Fora de finanças (padrão de qualidade):**
- [Raycast](https://www.raycast.com/): um cubo em degradê vermelho visto através de vidro fosco que gira com o cursor. É quase exatamente como mostrar o urso e o touro em degradê dentro de uma Torre de vidro azul-marinho.
- [Dogstudio](https://dogstudio.co/): o mascote da marca em 3D segue o cursor. É o exemplo clássico de "um objeto só reagindo ao mouse".
- [Igloo Inc](https://www.igloo.inc/): melhor site do ano de 2024 no Awwwards e referência de qualidade de material.
- [Hubtown](https://hubtown.co.in/): um monólito luminoso como metáfora de torre, numa construtora.

**Galerias para garimpar:** [Awwwards 3D](https://www.awwwards.com/websites/3d/), [Awwwards three.js](https://www.awwwards.com/websites/three-js/), [Awwwards luxo](https://www.awwwards.com/websites/luxury/), [Comunidade Spline](https://community.spline.design/), [Dribbble 3d-logo-animation](https://dribbble.com/tags/3d-logo-animation), [Lapa Ninja 3D](https://www.lapa.ninja/category/3d-websites/).

### Caminhos técnicos

**Ponto de modelagem:** a Torre de xadrez é uma forma de revolução. O corpo deve ser um volume de verdade (modelado no Blender, ou girando a meia-silhueta com `LatheGeometry` no three.js), com as ameias recortadas. O urso e o touro funcionam melhor como relevo ou incrustação na frente da Torre. Extrudar o logo chapado inteiro dá um "biscoito" sem profundidade.

| Caminho | Vantagem | Custo |
| --- | --- | --- |
| **Blender → GLB → React Three Fiber** | Controle total: material de verdade, reação ao cursor e à rolagem | three.js ~186 KB + R3F ~58 KB (gzip) + modelo de 50 a 300 KB. Exige modelador e desenvolvedor |
| **Spline** (`@splinetool/react-spline`) | Mais rápido para desenhar e testar variações | Runtime de ~275 KB que pode passar de 1 MB. Menos controle de performance; precisa de imagem estática por baixo |
| **Vídeo ou sequência pré-renderizada** | Vidro e reflexos fotorrealistas, igual em qualquer aparelho, sem 3D no navegador | 1 a 5 MB de vídeo. Interação limitada a avançar e voltar quadros |
| **SVG extrudado no three.js** | O mais barato, fiel ao vetor | Fica chapado. Serve para o relevo do urso e do touro, não para o corpo da Torre |

**Caminho híbrido sugerido:** mostrar primeiro uma imagem ou vídeo pré-renderizado da Torre e, em computadores que aguentam, trocar pela Torre 3D ao vivo (React Three Fiber). No celular: limitar a resolução, pausar fora da tela e respeitar o movimento reduzido.

### Perguntas que estavam em aberto (respondidas em 08/11/2026)
- **Modelo a seguir:** nenhuma referência é copiada. A direção é "Uma volta na Torre" (acima).
- **O que o 3D faz:** reage **só à rolagem**. Não gira sozinho nem segue o cursor.
- **Material e clima:** laca azul-marinho com o urso e o touro em metal quente, sobre fundo claro (porcelana).
- **Escopo do 3D:** só a Torre, com o urso e o touro como incrustação na frente.

---

## 4. O que NÃO é mais modelo

| Item | Situação |
| --- | --- |
| **Abertura do touro × urso** (corrida, choque, explosão de luz, Torre nascendo da luz) | **Descartada de vez.** Não usar, não recriar, não sugerir. |
| Vídeo do Google Flow (Veo 3.1) e a sequência de quadros num canvas guiada pela rolagem | Removidos junto com a abertura. |
| Layout e seções da versão anterior (Hero com emblema e telemetria, Método Torre & Touro, Pilares, Simulador, Programas, Sede) | Removidos. Não servem de base para a nova versão. |
| Identidade "Fortaleza Financeira & Brutalismo Arquitetônico de Luxo" (concreto escuro, LED diagonal a 32°, cantos chanfrados, Cinzel + Plus Jakarta Sans + JetBrains Mono) | Não é mais referência obrigatória. Só volta se o autor pedir. |

**Continua valendo:** o logo do cliente deve aparecer **idêntico ao original** (formas e cores), mesmo quando reinterpretado em 3D. **Exceção autorizada pelo autor (08/11/2026):** o redesenho do urso e do touro com linhas mais retas.

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
| 5 | 08/11/2026 | **Nova direção definida: "Uma volta na Torre"** (seção 3). Fase 1 feita: Torre, miolo, emblema e nome extraídos do logo em vetor (`design/torre/extract_torre.py`). |
| 6 | 08/11/2026 | **Fatia de prova construída** (Fase 2): Torre 3D, hero, bloco Finanças Empresariais, assinatura e contato. Commit `a61a738` ("NEXFORT 2.0"). |
| 7 | 08/11/2026 | **Feedback do autor sobre a fatia** (4 ajustes, seção 3) e **prompt da Fase 3** salvo em `PROMPT_FASE_3.md`; ferramentas de QA levadas para `design/qa/`. |
| 8 | 09/11/2026 | **Fase 3 executada** em modo auto (seção 3.1): paleta 60-30-10, redesenho do miolo (A), Torre de duas faces, revelação pelo lado, blocos 02 a 06, prancha de decisões e QA com números. Sem commit. |

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
| 08/11/2026 | A Torre gira **só com a rolagem** (uma volta na página), nunca sozinha | Rotação perpétua lembra protetor de tela, gasta bateria e contradiz a solidez da marca. |
| 08/11/2026 | Fundo claro, porcelana | A Torre marinho só aparece bem no claro; preto com dourado é a estética do guru de day-trade. |
| 08/11/2026 | 3D só na Torre; o nome fica plano | "NEXFORT CAPITAL" em 3D vira WordArt. |
| 08/11/2026 | Blocos imagem/texto alternados; a imagem é a Torre; retratos só nos sócios | Pedido do autor; foto de banco de imagem é o caminho mais curto para parecer template. |
| 08/11/2026 | Rolagem livre com revelação; nada de slides presos à rolagem | Prender a rolagem irrita no celular e no trackpad e atrapalha leitor de tela. |
| 08/11/2026 | Geometria 3D procedural, sem Blender, modelo de IA ou Spline | Mais fiel ao logo (perfil medido), mais leve e feita só com código. |
| 08/11/2026 | three 0.187 e @react-three/fiber 9.8 (o drei saiu: estúdio e sombra foram feitos à mão) | R3F 9 aceita React `>=19 <19.4` (temos 19.3). Estúdio próprio permite compilar os shaders em paralelo; a sombra pré-calculada evita um passe de render. |
| 08/11/2026 | Fontes provisórias: Newsreader + Hanken Grotesk | Serifa editorial de alto contraste e grotesca neutra; a escolha final é da Fase 3. |
| 08/11/2026 | O nome "NEXFORT CAPITAL" é traçado do logo, não digitado numa fonte | Nenhuma fonte disponível reproduz o desenho original. |
| 08/11/2026 | Redesenho do miolo com linhas mais retas, alterando de leve o logo | Pedido do autor: o traçado do JPEG deixava o urso e o touro "tortos". |
| 08/11/2026 | Desenho nas duas faces da Torre; ela descansa sempre com o desenho virado para o texto (~3 voltas na página) | Pedido do autor: o verso só azul deixava a Torre simples demais. Substitui a "uma volta linear". |
| 08/11/2026 | Revelação horizontal pelo lado no desktop; vertical no celular | Pedido do autor; no celular, o texto acompanha o movimento vertical da cena. |
| 08/11/2026 | Paleta por harmonia: 60-30-10, âmbar complementar como destaque, fundo neutro tingido análogo ao marinho | Pedido do autor, com pesquisa e números em OKLCH (no `PROMPT_FASE_3.md`). |
| 08/11/2026 | A Fase 3 roda em modo auto, sem paradas para aprovação | Decisão do autor: a sessão decide pelas recomendações e mostra tudo no fim; as escolhas ficam fáceis de trocar. |
| 09/11/2026 | Fundo `#F6F5F9`, botão principal âmbar com texto marinho, títulos e rodapé em marinho | Paleta 60-30-10: o âmbar do logo já é o complementar do marinho (165,3°); o fundo é análogo (26,9°). O porcelana antigo era tingido para o lado do destaque. Proporção medida: 86/8,5/2,5 (vale como papel, não como área). Alternativa: `#F2F6F9` |
| 09/11/2026 | Redesenho A do miolo (reta onde é reta, curva só onde é curva), no 3D, no emblema e no favicon | Menor ruído sem perder a leitura de urso e touro (desvio máx. 1,51 px). B (facetado) fica registrado; o original também (`--variante`) |
| 09/11/2026 | Tipografia confirmada: Newsreader + Hanken Grotesk | O contraste da Newsreader em título ecoa o nome do logo; a alternativa (Source Serif 4 + IBM Plex Sans) achata o título |
| 09/11/2026 | A Torre descansa 35° virada para o lado do texto, desenho nas duas faces, giro por descanso na mesma curva da viagem (~3 voltas) | Pedido do autor (verso só azul era simples demais); substitui o giro linear |
| 09/11/2026 | Emenda lateral esmaecida (6% do raio) | Sem isso o verso espelhado deixa uma costura quente/azul no meio da Torre ao girar |
| 09/11/2026 | Revelação: horizontal pelo lado no desktop, vertical abaixo de 1024 px, títulos sem máscara, 900 ms, hero também em 900 ms | Pedido do autor; uma transição só |
| 09/11/2026 | Salto de rolagem e "menos movimento" tratados no rig (giro por equivalência só no salto do alvo; pose travada com menos movimento) | Revisão de código: o atraso do amortecimento não pode inverter o giro e quem pede menos movimento não vê a Torre girar |
| 09/11/2026 | Sócios: retratos em iniciais, cargos e bios "a confirmar", Torre fora de cena | Nada de foto do Instagram sem autorização nem rosto falso |
| 09/11/2026 | Onde o verificador da `design-taste-frontend` bate com decisão do autor, vale a do autor | Pedido do prompt da Fase 3 (3D fora de tecnologia, Torre como visual, 120svh, slogan como h1, dados públicos reais) |

---

## 8. Regras para continuar o projeto (para humanos e IAs)

- **Não use a animação do touro e do urso se chocando.** Nem como base, nem como variação.
- **Não reaproveite a versão anterior** como ponto de partida sem o autor pedir.
- **Motion:** siga o `CLAUDE.md` (só `transform` e `opacity`; molas `stiffness 300`, `damping 30`, `mass 1`; curva `cubic-bezier(0.22, 1, 0.36, 1)`; GSAP dentro de `useGSAP({ scope })`; imports de `motion/react`).
- **Conteúdo:** quando o site voltar a ter texto, centralize-o num arquivo só (como era `src/content/nexfort.ts`).
- **Logo e Torre:** `geometry.ts`, `miolo.ts`, `marks.ts` e `icon.svg` são gerados por `python design/torre/extract_torre.py` (`--check PASTA` grava imagens de conferência; `--variante A|B|original` escolhe o miolo). O desenho do miolo vem de `design/torre/miolo-redesenho.json`, gerado por `curar_miolo.py`. Não edite os gerados à mão. Rode o Python com `PYTHONDONTWRITEBYTECODE=1`: há um `__pycache__/*.pyc` versionado por engano em `design/torre/`, e cada execução o altera.
- **Verificação:** use os roteiros de `design/qa/` (capturas, recortes da Torre, revelação, orçamento de desenho, tempos, reservas, gravação, perfil de CPU; ver `design/qa/README.md`). Meça antes de afirmar que algo está bom. Nunca rebuilde com o servidor de pé (o `.next` muda por baixo dele) e encerre o servidor antigo pelo PID, conferindo a linha de comando.
- **Commits:** a IA só commita ou dá push quando o autor pede.

---

## 9. Cuidados antes da abordagem

- **Demonstração online:** use uma URL de prévia (ex.: Vercel) **sem indexação** (`robots: noindex`, já no `layout.tsx`; tire só no deploy oficial) e, se possível, com senha. Não use domínio parecido com o da empresa.
- **Dados estruturados:** se voltar um JSON-LD que apresente o site como o negócio da Nexfort, não o deixe indexável antes da venda.
- **Domínio final:** defina `NEXT_PUBLIC_SITE_URL` no deploy oficial, para que as imagens de compartilhamento usem URL absoluta.

---

## 10. Pendências e próximos passos (09/11/2026)

- **Revisão final do movimento:** o autor roda `/review-animations` (só ele pode disparar essa skill).
- **Servidor de produção:** a porta 3100 estava ocupada por um `next start` de uma sessão anterior, e o classificador do modo auto não permitiu encerrá-lo. O servidor novo ficou na porta 3101. Para trocar: encerre o processo da 3100 (confira que é `next start`) e rode `npx next start -p 3100`.
- **Dados a confirmar com a Nexfort antes de qualquer publicação:** cargos, biografias e fotos dos sócios; descrições dos programas e "6 edições"; textos dos blocos (rascunho da IA); registro profissional (CVM, ANCORD, CFP) antes de falar em recomendação de investimentos.
- **Silhueta 2D (reserva sem WebGL e sem JavaScript):** herda a escada do JPEG na borda direita (só aparece nessa reserva em tamanho grande). O 3D usa o perfil liso. Se incomodar: suavizar `sil_loops` em `extract_torre.py`.
- **Ângulo de descanso:** os 35° escondem o focinho do urso nos descansos de frente (hero, 02 e 04), onde a face vira para a esquerda; se o autor quiser ver mais do rosto, `FACING_ANGLE` em `choreography.ts` (25° a 30°).
- **Fase 4 (acabamento):** Lighthouse, teste num Android real, desempenho do carregamento no celular, `viewport-fit`/áreas seguras se o site for usado em tela cheia.
- **Cuidados antes da abordagem:** seção 9.
