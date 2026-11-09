# Memória e decisões do projeto: Nexfort Capital

Última atualização: 08/11/2026.

> **Estado atual: reconstrução em andamento.** Em 08/11/2026 o site foi zerado e a nova direção foi definida: **"Uma volta na Torre"** (seção 3), com a Torre do logo em 3D. Primeiro vem uma fatia de prova (hero, um bloco e a assinatura), que o autor aprova antes de seguirmos.

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
| Página | **Fatia de prova (Fase 2)**: hero, um bloco imagem/texto (Finanças Empresariais) e a assinatura com contato. Aguarda o teste de aprovação do autor |
| Código | `src/components/torre/` (palco, cena, Torre, coreografia e dados gerados), `src/components/sections/` (Hero, SplitBlock, Signature, Reveal, TorreAnchor, Chrome), `src/components/brand/` (emblema e nome em SVG), `src/components/providers/SmoothScroll.tsx`, `src/content/nexfort.ts` (todo o texto), `src/lib/` (`cn`, registro do GSAP) |
| Ativo | `design/referencias/logo-nexfort-original.png`: logo original (1080 × 1080 px), matéria-prima de `design/torre/extract_torre.py`, que gera a geometria, o miolo, o emblema, o nome e o favicon (`src/app/icon.svg`) |
| Stack | Next.js 16.4 (App Router, Turbopack, Cache Components), React 19.3, TypeScript, Tailwind CSS 4, GSAP 3.15 (ScrollTrigger, SplitText), Lenis, three 0.187, @react-three/fiber 9.8. Motion e next-view-transitions seguem instalados, sem uso |
| Fontes (provisórias) | Newsreader (títulos, com eixo óptico) + Hanken Grotesk (texto), via `next/font`. A escolha final sai na prancha da Fase 3 |
| Prévia | `robots: noindex` já no `layout.tsx` (seção 9) |
| Build | `npm run build`, `npx tsc --noEmit` e `npx eslint src --max-warnings=0` passando (08/11/2026) |
| Versão anterior | Inteira no histórico do Git. Último commit dela: `83bc42e`. Para recuperar um arquivo: `git show 83bc42e:<caminho>` |

### O que foi removido em 08/11/2026
- Todas as seções e componentes (`src/components/`), o conteúdo (`src/content/nexfort.ts`) e os utilitários (`src/lib/`).
- Ícone, imagens de Open Graph e Twitter, fontes, providers (Lenis, Motion, View Transitions) e dados estruturados (JSON-LD).
- `public/` inteiro: quadros da abertura, recortes da Torre e logo.
- `design/motion/`: vídeo do Google Flow, quadros de referência, scripts Python e o guia do Flow.

---

## 3. Nova direção (definida em 08/11/2026): "Uma volta na Torre"

### Decisões do autor
1. A Torre do logo em 3D, **girando só com a rolagem**: uma volta completa ao longo da página, terminando de frente (= o logo). Nada de rotação perpétua.
2. Fundo **claro, porcelana**. Nada de preto com dourado, a estética do guru de day-trade.
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
2. Fatia de prova (hero + Finanças Empresariais + assinatura): **construída em 08/11/2026; aguarda o teste de aprovação** (capturas, gravação e o autor rodando `/review-animations`).
3. Blocos e conteúdo.
4. Acabamento (acessibilidade, Lighthouse, teste num Android real).

### Como a fatia foi construída (para quem continuar)
- **Torre 3D procedural**: corpo de revolução com o perfil redesenhado sobre a medida (trechos lisos: retas, polinômios de grau baixo; resíduo ≤ 0,41 px) e 8 ameias. O urso e o touro são uma textura projetada de frente, então a vista frontal fica idêntica ao logo. **Um material só** (`MeshPhysicalMaterial` com verniz): a metade de trás e as ameias apontam o UV para uma área azul-marinho da textura.
- **Estúdio**: luzes retangulares viram mapa de ambiente (PMREM 512). Os shaders do PMREM e da Torre compilam **em paralelo** antes do primeiro quadro (o canvas nasce em `frameloop="never"`), e só então começa a Chegada.
- **Coreografia** (`choreography.ts`): âncoras no layout; a Torre descansa centralizada em cada seção (no celular, nunca cortada no topo), viaja com `power3.inOut`, recua 40% no meio da travessia (desktop) ou esmaece (celular), e gira de forma linear com a rolagem, de −35° (hero) a 360° (assinatura). Depois do último descanso, acompanha a página. Com "menos movimento", some no meio do caminho e reaparece no lugar, sem giro.
- **Revelação**: o GSAP só decide quando (ScrollTrigger, uma vez) e divide o título em linhas (SplitText com máscara). O movimento é transição CSS (compositor). O texto só nasce escondido com JS ativo; se o app não confirmar em 4 s, tudo aparece.
- **Sombra**: degradê radial pré-calculado sob a base (sem passe extra de render).
- **Medido** (Chrome com GPU, 1440×900): **0 chamadas de desenho com a página parada**; ~400 durante 1,7 s de rolagem. Maior tarefa longa do carregamento: ~200 ms (antes das correções era 1,6 s, por compilação síncrona de shaders).
- **Reservas**: sem WebGL ou sem JavaScript, o emblema 2D do logo aparece em cada âncora e todo o texto fica legível.
- **Aviso conhecido**: `THREE.Clock` obsoleto no console vem de dentro do R3F 9.8, não do nosso código.

Skills previstas: `/animate`, `/animation-performance`, `/frontend-design`, `/landing-page-design`, `/design-taste-frontend`, `/ui-ux-pro-max`, `/web-design-guidelines` e `/review-animations`. Esta última só o autor dispara (`disable-model-invocation: true`).

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
| 5 | 08/11/2026 | **Nova direção definida: "Uma volta na Torre"** (seção 3). Fase 1 feita: Torre, miolo, emblema e nome extraídos do logo em vetor (`design/torre/extract_torre.py`). |
| 6 | 08/11/2026 | **Fatia de prova construída** (Fase 2): Torre 3D, hero, bloco Finanças Empresariais, assinatura e contato. Aguarda aprovação do autor. |

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

---

## 8. Regras para continuar o projeto (para humanos e IAs)

- **Não use a animação do touro e do urso se chocando.** Nem como base, nem como variação.
- **Não reaproveite a versão anterior** como ponto de partida sem o autor pedir.
- **Motion:** siga o `CLAUDE.md` (só `transform` e `opacity`; molas `stiffness 300`, `damping 30`, `mass 1`; curva `cubic-bezier(0.22, 1, 0.36, 1)`; GSAP dentro de `useGSAP({ scope })`; imports de `motion/react`).
- **Conteúdo:** quando o site voltar a ter texto, centralize-o num arquivo só (como era `src/content/nexfort.ts`).
- **Logo e Torre:** `geometry.ts`, `miolo.ts` e `marks.ts` são gerados por `python design/torre/extract_torre.py` (`--check PASTA` grava imagens de conferência). Não os edite à mão.
- **Commits:** a IA só commita ou dá push quando o autor pede.

---

## 9. Cuidados antes da abordagem

- **Demonstração online:** use uma URL de prévia (ex.: Vercel) **sem indexação** (`robots: noindex`, já no `layout.tsx`; tire só no deploy oficial) e, se possível, com senha. Não use domínio parecido com o da empresa.
- **Dados estruturados:** se voltar um JSON-LD que apresente o site como o negócio da Nexfort, não o deixe indexável antes da venda.
- **Domínio final:** defina `NEXT_PUBLIC_SITE_URL` no deploy oficial, para que as imagens de compartilhamento usem URL absoluta.
