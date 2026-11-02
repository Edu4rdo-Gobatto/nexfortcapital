# Memória e decisões do projeto: landing Nexfort Capital

Última atualização: 02/11/2026.

---

## 1. Contexto do projeto

### Objetivo comercial
- Esta landing page é uma **proposta especulativa**. A ideia é vendê-la à **Nexfort Capital Consultoria** (Sinop - MT).
- **A Nexfort ainda não sabe do projeto.** A estratégia é chegar com o produto pronto, funcionando, para chamar a atenção na primeira abordagem.
- Até a venda, a página **não é o site oficial** da empresa. Ela usa nome, endereço, telefone e perfis públicos da Nexfort só como conteúdo de demonstração.

### Como o projeto foi feito
- **Tudo foi gerado com IA:** o código, escrito pelo Claude Code, e os próprios prompts e briefings enviados a ele.
- O autor humano (Eduardo, conta `Edu4rdo-Gobatto`) dirige o projeto: define o objetivo, escolhe entre as opções propostas, aprova os planos e valida o resultado.
- As regras de engenharia que a IA deve seguir estão em `CLAUDE.md` e `AGENTS.md`. O guia da stack está em `ESTUDO_MOTION_STACK.md`.

---

## 2. Estado atual

| Item | Valor |
| --- | --- |
| Repositório | `github.com/Edu4rdo-Gobatto/nexfortcapital` (**público**) |
| Commits | `05d0231` (31/10/2026) landing completa · `5459be1` (01/11/2026) refatoração de hover, ticker, Método e Google |
| Build | `npm run build` e `npx eslint src --max-warnings=0` passando. Único aviso: `metadataBase` (ver pendências) |
| Stack | Next.js 16.4 (App Router, Turbopack), React 19.3, TypeScript, Tailwind CSS 4, Motion 14, GSAP 3.15 + ScrollTrigger, Lenis |
| Conteúdo | Todo o texto, contatos e premissas ficam em `src/content/nexfort.ts`, a fonte única |
| Prancha antes × depois | https://claude.ai/artifact/P4pfTd4J6kWmjopokn9Usv (privada; para mostrar a alguém, compartilhe pelo menu Share) |

### Seções da página, em ordem (`src/app/page.tsx`)
1. **Navbar:** logo, links por âncora, CTA do WhatsApp e menu mobile com foco preso.
2. **Abertura em rolagem (`BrandPrologue`), fora do `<main>`:**
   - o touro e o urso correm, se chocam e explodem em luz;
   - a luz se recolhe na Torre, com "NEXFORT CAPITAL" e a linha de atuação embaixo;
   - é uma sequência de quadros num canvas, guiada pela rolagem;
   - some com movimento reduzido e sem JavaScript.
3. **Hero:**
   - selo "CONSULTORIA FINANCEIRA EM SINOP • MT" e headline (slogan);
   - CTAs: WhatsApp e Simular evolução;
   - link do endereço;
   - emblema animado Torre + Touro, com 4 cards de telemetria e botão de pausa.
4. **Método Torre & Touro:** seção fixada na tela (GSAP ScrollTrigger) em que a Torre se transforma no Touro conforme a rolagem.
5. **Pilares:** 3 cards (Finanças Empresariais, Finanças Pessoais, Investimentos & Bolsa).
6. **Simulador patrimonial:** sliders, gráfico com leitura por ano e aviso legal.
7. **Programas e sócios:** abas ITM / Finance Pro, linha do tempo de edições e os dois sócios com Instagram.
8. **Sede:** placa de visita (endereço, horário, telefone) e CTA.
9. **Rodapé:** links e voltar ao topo.

Também fazem parte da página: dados estruturados (`JsonLd`, schema.org LocalBusiness) e imagens de compartilhamento (Open Graph/Twitter).

---

## 3. Identidade visual (por que a página tem essa cara)

- **Conceito:** "Fortaleza Financeira & Brutalismo Arquitetônico de Luxo". Ele vem da sede real da Nexfort: concreto escuro e uma **linha diagonal de LED na fachada (~32°)**.
- **Emblema:** a Torre de xadrez (proteção, estrutura) e o Touro (mercado em alta, crescimento) traduzem o slogan "Organize, multiplique e tenha liberdade".
- **Paleta:**

  | Papel | Cor |
  | --- | --- |
  | Fundos | ink `#060913`, concrete `#0d1322`, navy `#0f1738` |
  | Azuis | royal `#1e2d6b`, royal-glow `#3b55c4` |
  | Ouro e laranja | gold `#f59e0b`, ember `#ea580c` |
  | Detalhe | crimson `#b91c1c` |
  | Texto | led `#f8fafc`, muted `#94a3b8` |

- **Tipografia:** Cinzel (títulos), Plus Jakarta Sans (texto) e JetBrains Mono (dados).
- **Assinaturas visuais:** cantos chanfrados (`clip-chamfer`), textura de concreto (`concrete-noise`) e divisores de LED diagonais entre as seções.

---

## 4. Histórico: o que foi feito, como e por quê

### Fase 1: construção da landing (commit `05d0231`, 31/10/2026)
- **O quê:** a página completa, com as 8 seções acima, o simulador, o emblema animado, SEO e acessibilidade (`prefers-reduced-motion` respeitado, pausa no emblema, foco visível).
- **Como:** a IA gerou o código a partir de briefings também gerados por IA. As skills `frontend-design` e `vercel-react-best-practices` foram instaladas no projeto e as regras de motion ficaram no `CLAUDE.md`.
- **Por quê:** ter um produto completo e diferenciado para apresentar, com a identidade da sede e não um template genérico.
- *Os prompts exatos desta fase não estão registrados aqui; o histórico vem do código e do commit.*

### Fase 2: limpeza cirúrgica (commit `5459be1`, 01/11/2026)

**Pedido:** tirar os excessos visuais e preservar as transições que ficaram boas. Foram 5 correções.

| # | O que mudou | Por quê |
| --- | --- | --- |
| 1 | **Fim da "fumaça" nos cards.** Saiu o `TiltCard` (inclinação 3D com luz que seguia o mouse) e entrou o `PillarSlab`, um card sólido e estático. Saíram também o efeito magnético dos botões, o brilho que varria os CTAs e o halo do logo no hover. | Hover só onde há clique. Cards, listas, selos e títulos não são clicáveis, então não reagem. O excesso de efeito parecia template de IA e tirava a seriedade de uma consultoria financeira. |
| 1b | **Nova hierarquia de hover:** os CTAs clareiam (dourado: rampa âmbar-400 → laranja-500) e a seta anda 3px; links da navbar e do rodapé passam de cinza a branco; abas, sliders e Instagram dos sócios mantêm resposta própria. | Feedback claro e discreto. O dourado novo também aumenta o contraste do texto (5,6:1 → 6,8:1). |
| 2 | **Saiu o letreiro diagonal (`MarketTicker`)** e o card "Escolha um modo..." abaixo do emblema, junto com todo o sistema de "modos" do emblema, que virou código morto. | Poluição visual. O emblema ficou idêntico ao estado padrão de antes. |
| 3 | **Método Torre & Touro:** saíram subtítulos, textos e bullets; ficaram só os rótulos "A Torre" e "O Touro". A animação de rolagem **não foi tocada**. | A transição era o ponto forte; o texto disputava atenção com ela. Os rótulos ficam como espaço para a copy definitiva. |
| 4 | **Saiu a nota "5,0 ★ Google"** do selo da Hero e da placa da Sede. | É uma afirmação que não podemos garantir em nome da empresa; para uma proposta não solicitada, é um risco. O JSON-LD já não tinha avaliação. |
| 5 | **Validação:** build e lint limpos, busca por restos de código e capturas reais antes × depois. | Garantir que nada quebrou e documentar visualmente a mudança. |

**Como foi feito:**
1. **Plano antes de editar.** A IA leu o código, mapeou os nomes reais (o pedido citava `InteractiveCard`, que não existia; o efeito estava em `TiltCard`) e fez 3 perguntas, que foram respondidas.
2. **Execução em paralelo.** 4 agentes de IA editaram partes separadas do código (emblema, pilares, CTAs/links, Hero/conteúdo/Método) e depois rodaram o build.
3. **Revisão adversarial.** 4 revisores procuraram problemas e outros agentes tentaram derrubar cada achado. 9 achados foram confirmados (6 problemas distintos) e 6 refutados.
   - **Corrigidos:** emblema da Hero desalinhado, seta do "voltar ao topo" que ainda se mexia, botão de pausa sem transição, SVG duplicado no card do touro, `overflow` sobrando no logo e o README desatualizado.
4. **Validação visual.** O commit antigo e o atual rodaram lado a lado num Chrome sem interface, com capturas na mesma posição de rolagem. Disso saiu a prancha de design antes × depois (link na seção 2).

**Mantido de propósito (decisão do autor):** a paralaxe do emblema ao mover o mouse, os 4 cards de telemetria (IBOV, CDI, B2B, PAT), as linhas de LED estáticas, a leitura do gráfico do simulador e o hover dourado dos links do menu mobile.

### Fase 3: motion da logo e abertura em rolagem (02/11/2026, sem commit)

**Pedido:** animar a logo do cliente. Um touro e um urso correm um contra o outro, colidem e formam a Torre. O vídeo seria gerado no Google Flow e, no site, deveria mexer junto com a rolagem.

**Como foi feito:**
1. **Frames de referência:** a IA gerou os quadros de início e de colisão em `design/motion/frames/`, já na versão escura do site.
2. **Google Flow (Veo 3.1, Frames to Video):** no primeiro teste, o Veo ignorou a imagem final da logo e desenhou uma torre própria, com zoom e som. A solução foi híbrida: o Flow faz só a corrida, o choque e o flash, e a Torre nasce no código, com o vetor real. Guia e prompts em `design/motion/GUIA_GOOGLE_FLOW.md`.
3. **Corte da pausa:** o `flow-v2.mp4` tinha ~1,3 s dos bichos se encarando antes do flash. Uma medição quadro a quadro (posição, movimento e brilho) achou pontos de corte em que eles estão na mesma posição. Ficaram 55 quadros: corrida, choque, flash e explosão.
4. **Quadros:** `design/motion/build_prologue.py` gera WebP de 1920px e 1280px em `public/motion/prologue/` (1,4 MB e 0,7 MB no total), com o fundo ajustado para o ink do site.
5. **Componente `src/components/brand/BrandPrologue.tsx`:**
   - a rolagem dentro de uma seção alta (palco sticky) avança os quadros num canvas, via GSAP ScrollTrigger com scrub;
   - depois, uma esfera de luz cobre a tela e se recolhe no centro, de onde nascem a Torre (`NexfortEmblem`), o nome e a linha de atuação.
6. **Hero:** as entradas em CSS da Hero esperam a abertura terminar (`data-prologue` + `data-awaits-prologue`, regra em `globals.css`). Sem isso, elas rodariam no carregamento, fora da tela.
7. **Validação:**
   - build e lint limpos;
   - capturas num Edge sem interface no desktop (1440×900), no celular (390×844) e com movimento reduzido;
   - as capturas levaram a três ajustes: a luz passou a crescer e se recolher em vez de "acender" (evita véu cinza), a linha de atuação ficou numa linha no desktop e o "|" deixou de abrir linha no celular.

**Por quê:** a rolagem guiada dá o efeito de site moderno pedido. A sequência de quadros num canvas é a técnica mais fluida e previsível entre navegadores (inclusive Safari), e a Torre em código garante a logo fiel.

---

## 5. Registro de decisões

| Data | Decisão | Motivo |
| --- | --- | --- |
| 31/10/2026 | Conteúdo centralizado em `src/content/nexfort.ts` | Trocar textos e números sem mexer nas seções. |
| 31/10/2026 | Cards de telemetria qualitativos, sem cotações | Nada de números de mercado inventados. |
| 31/10/2026 | Simulador com 12% a.a. **hipotético** e aviso legal visível | Regras da CVM: sem promessa de retorno. |
| 01/11/2026 | Hover só em elementos clicáveis | Seriedade e clareza; menos cara de template. |
| 01/11/2026 | Remoção do efeito magnético e do brilho do logo | Escolha do autor no plano. |
| 01/11/2026 | Remoção da nota do Google | Afirmação não verificável em nome do cliente. |
| 01/11/2026 | Transições de cor nos links (exceção à regra "só transform/opacity") | Pedido explícito; registrada no README, o `CLAUDE.md` não foi alterado. |
| 02/11/2026 | Este arquivo e o `ESTUDO_MOTION_STACK.md` ficam versionados no Git, com o repositório público | Decisão do autor: não há risco em expor o projeto. |
| 02/11/2026 | Motion da logo na versão escura do site (touro azul-real, contorno LED) | O azul-marinho original some no fundo `#060913`. |
| 02/11/2026 | O Flow gera só a corrida, o choque e o flash; a Torre nasce em código | O Veo redesenha a logo quando a imagem final é muito diferente da inicial. |
| 02/11/2026 | Abertura em rolagem (quadros num canvas) no lugar da intro automática | Pedido do autor: o vídeo deve mexer junto com o scroll, como em sites modernos. |
| 02/11/2026 | As entradas da Hero esperam a abertura terminar | Senão rodariam escondidas, no carregamento. |
| 02/11/2026 | Logo original (Torre com urso e touro) em todo o site, no lugar do vetor antigo com o "touro gordo" | Pedido do autor: a logo tem que ser idêntica à do cliente. Ela foi reconstruída em alta resolução por `design/motion/extract_logo.py`; Hero e Método ganharam animações mais simples, com a imagem. |

---

## 6. Regras para continuar o projeto (para humanos e IAs)

- **Motion:**
  - anime só `transform` e `opacity`;
  - molas do Motion com `stiffness 300`, `damping 30` e `mass 1`;
  - curva padrão `cubic-bezier(0.22, 1, 0.36, 1)`;
  - GSAP sempre dentro de `useGSAP({ scope })`;
  - importe de `motion/react`.
- **Hover:** só em CTAs, links, abas, sliders e Instagram. Cards e listas ficam estáticos.
- **Método Torre & Touro:** não mexa na lógica de `TowerAndBullStory.tsx` nem em `story/timeline.ts` sem necessidade; a transição está aprovada.
- **Abertura (`BrandPrologue`):**
  - para trocar o vídeo, siga a seção 7 do `design/motion/GUIA_GOOGLE_FLOW.md` (script + `FRAME_COUNT`);
  - não tire o `data-awaits-prologue` da Hero nem a regra de pausa do `globals.css` sem tirar a abertura junto.
- **Conteúdo:** sempre em `src/content/nexfort.ts`.
- **Commits:** a IA só commita ou dá push quando o autor pede.

---

## 7. Validação seção a seção (próximo passo do autor)

Para cada seção: desktop e celular, teclado (Tab), movimento reduzido e textos.

- [ ] **Navbar:** links levam às âncoras certas; CTA abre o WhatsApp; menu mobile abre e fecha e prende o foco.
- [ ] **Abertura:**
  - a rolagem avança corrida, choque e explosão sem saltos, e voltar a rolar volta a cena;
  - a luz se recolhe na Torre;
  - "Pular abertura" leva à Hero, que entra animada;
  - com movimento reduzido, a página começa direto na Hero.
- [ ] **Hero:** selo, headline e subtítulo; os dois CTAs; link do endereço; emblema e botão de pausa; alinhamento do emblema com o texto.
- [ ] **Método:** a transição Torre → Touro está fluida; rótulos "A Torre" / "O Touro". **Falta a copy definitiva.**
- [ ] **Pilares:** cards estáticos; textos e itens de cada pilar.
- [ ] **Simulador:** sliders, valores, gráfico, aviso legal e CTA.
- [ ] **Programas e sócios:** abas ITM / Finance Pro, linha do tempo ("1ª à 6ª edição", marcador "Próxima edição"), nomes, cargos e Instagram dos sócios.
- [ ] **Sede:** endereço, horário, telefone, link do mapa e CTA.
- [ ] **Rodapé:** links e voltar ao topo.

---

## 8. Pendências e cuidados antes da abordagem

### Conteúdo a confirmar (a IA escreveu ou supôs; nada foi validado com a Nexfort)
- **Missão** (`BRAND.mission`): texto criado para a página, não é uma frase oficial da empresa.
- **Premissas do simulador:** 6,17% a.a. na poupança e 12% a.a. hipotético; o texto do aviso legal.
- **ITM:** "6 edições" e a existência de uma próxima edição.
- **Sócios:** nomes, cargos e perfis (`@lucasspinolaconsultor`, `@agabriella_valadao`). Hoje aparecem com monogramas; com fotos, fica mais forte.
- **Contato:** endereço, CEP, horário e WhatsApp `(66) 99259-4858`. O comentário em `nexfort.ts` diz "URL oficial fornecida pela empresa", mas a empresa ainda não forneceu nada; corrija o comentário ou confirme a origem.
- **Copy do Método:** só há rótulos.

### Cuidados com a abordagem
- **Demonstração online:**
  - use uma URL de prévia (ex.: Vercel) **sem indexação** (`robots: noindex`, que ainda não existe no projeto) e, se possível, com senha;
  - não use domínio parecido com o da empresa;
  - o `JsonLd` se apresenta como o LocalBusiness da Nexfort, então não deixe isso indexável antes da venda.
- **Domínio final:** defina `NEXT_PUBLIC_SITE_URL` no deploy oficial. Isso resolve o aviso de `metadataBase` e as imagens de compartilhamento.
- **Material de apoio para a reunião:** a prancha antes × depois mostra o cuidado com detalhes; o simulador e a transição do Método são os momentos de maior impacto para demonstrar ao vivo.
