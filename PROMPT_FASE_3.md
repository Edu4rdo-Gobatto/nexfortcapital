<!-- Gerado em 08/11/2026 a partir do feedback do autor sobre a fatia de prova (commit a61a738). Para executar: numa sessão nova do Claude Code, em modo auto, peça "execute o PROMPT_FASE_3.md". -->

# Prompt: Fase 3 da Nexfort Capital ("Uma volta na Torre")

## Seu papel
Você é engenheiro de front-end e designer sênior, no nível de um estúdio de ponta.
- Decide com critério, explica em uma linha, implementa, **mede** e **mostra**.
- Não concorda com tudo: se um pedido piorar o resultado, diga e proponha a alternativa. A decisão final é do autor (Eduardo).
- Escreva em português.

## Modo de execução: auto, sem paradas
- Trabalhe de ponta a ponta sem pedir confirmação para ações de rotina:
  - ler e editar arquivos do projeto;
  - instalar a devDependency prevista (`playwright-core`);
  - rodar build, lint, servidor, capturas e medições.
- **Não pare para aprovação.** Nas escolhas de marca (paleta, redesenho do miolo, tipografia), decida pelas recomendações deste prompt. Mude só se a prancha mostrar algo claramente melhor, e então justifique.
- Deixe cada escolha fácil de trocar depois:
  - paleta em tokens do `@theme`;
  - as duas variações do miolo guardadas no JSON;
  - as alternativas registradas na prancha e na MEMORIA.
- Pergunte ao autor (AskUserQuestion) **só se estiver realmente bloqueado**, por exemplo se um pedido bater com as regras do projeto.
- Continua proibido sem pedido explícito: commit, push, publicar qualquer coisa (artifact, deploy) e apagar arquivos que você não criou.

## Leia antes de qualquer código
1. `CLAUDE.md` e `AGENTS.md`: regras de motion e engenharia. O Next 16 tem mudanças: consulte `node_modules/next/dist/docs/` antes de usar uma API.
2. `MEMORIA_DO_PROJETO.md`: decisões, coreografia, mapa de conteúdo e "Como a fatia foi construída".
3. O código da fatia (commit `a61a738`):
   - `src/components/torre/`: `TorreStage.tsx`, `TorreScene.tsx`, `Torre.tsx`, `choreography.ts`;
   - `src/components/sections/`: `Hero`, `SplitBlock`, `Signature`, `Reveal`, `TorreAnchor`, `Chrome`;
   - `src/content/nexfort.ts`, `src/app/globals.css`, `design/torre/extract_torre.py`.
4. Confirme o ponto de partida: `git log -1` mostra `a61a738`; `npm run build`, `npx tsc --noEmit` e `npx eslint src --max-warnings=0` passam. Capture o estado "antes" (ver Etapa F).

## O que já existe (não refaça)
- **Torre 3D procedural:**
  - perfil de revolução redesenhado sobre o logo (resíduo ≤ 0,41 px);
  - 8 ameias com ângulos `asin(x/R)`;
  - urso e touro como textura projetada de frente;
  - **um material só** (`MeshPhysicalMaterial` com verniz); a metade de trás e as ameias apontam o UV para uma área azul-marinho.
- **Estúdio:** PMREM próprio, com os shaders do PMREM e da Torre compilados **em paralelo** antes do primeiro quadro (`pmremWarmup` usa a API interna do three 0.187, com reserva). O canvas nasce em `frameloop="never"` e passa a `"demand"`.
- **Coreografia (`choreography.ts`):**
  - âncoras no layout; descanso na seção centralizada (no celular, o topo da âncora fica a pelo menos 8% do topo da tela);
  - viagem com `power3.inOut`; recuo de 40% no meio da travessia no desktop; esmaecimento no celular;
  - depois do último descanso, a Torre acompanha a página.
- **Revelação (`Reveal.tsx`):** o GSAP decide quando (ScrollTrigger, uma vez) e o movimento é transição CSS. O texto só nasce escondido com `data-js`; reserva de 4 s.
- **Medido:**
  - 0 chamadas de desenho com a página parada;
  - maior tarefa longa no carregamento: ~200 ms;
  - reservas sem WebGL e sem JavaScript funcionando.

## Feedback do autor sobre a fatia (08/11/2026) e as decisões tomadas
| # | Pedido | Decisão |
| --- | --- | --- |
| 1 | Urso e touro "muito tortos", linhas mais retas | Redesenho limpo do miolo (Etapa B). Autorizado pelo autor: altera de leve o desenho do logo. Registre na MEMORIA |
| 2 | No 2º descanso só aparece a Torre azul | Desenho **nas duas faces** (verso espelhado, lê certo de trás). A Torre sempre descansa com o desenho virado para o texto; o giro passa a ser por descanso, ~3 voltas na página, só com a rolagem; termina de frente (Etapa C) |
| 3 | Informações com transição suave e horizontal pelo lado | Desktop (≥ 1024 px): o texto entra do lado em que está. No celular e no tablet empilhado: **vertical** (análise na Etapa D) |
| 4 | Paleta pela teoria das cores (destaque no lado oposto; fundo a ~30° da principal) | Método 60-30-10 + complementar + neutro tingido análogo, com números em OKLCH (Etapa A) |

## Ordem de trabalho
**A (prancha e decisões) → B, C, D → E → F → entrega. No fim, o autor roda `/review-animations`.**
Sem paradas no meio (modo auto).

### Etapa A: prancha (registro das decisões de paleta, miolo e tipografia)
Skills: `/frontend-design` (direção e tipografia) e `/ui-ux-pro-max` (checagem de paletas do setor financeiro, pares tipográficos e acessibilidade; a marca manda na cor, o banco de dados só confere).

**Paleta pelo método** (valores calculados em OKLCH):
- **Principal (30%):** marinho do logo `#0C035B`, OKLCH (0,224; 0,140; 270,9°). Fixo.
- **Destaque (10%):** o complementar do marinho.
  - O complemento perceptual exato fica em h ≈ 91°. O âmbar do logo `#FBAE14` (h 76,2°) está a **165°** do marinho: **a marca já tem o seu complementar**. Use esse âmbar como destaque.
  - Botão principal: fundo âmbar, texto marinho (contraste **9,5:1**).
  - **Nunca** âmbar como texto sobre fundo claro (1,7:1).
  - O foco visível continua marinho (precisa de 3:1).
  - Destaque só em CTAs, filetes e marcadores: no máximo 10% da tela.
- **Fundo (60%):** neutro tingido **análogo** ao marinho (matiz a ±30°, croma ~0,006, L ~0,97):
  - `#F6F5F9`: +30°, cinza-violeta. **Recomendado:** menos clínico, conversa com o índigo do marinho.
  - `#F2F6F9`: −30°, cinza-azulado.
  - Mostre também a porcelana atual `#F3F1EC` como referência: ela tem h 88,6°, ou seja, está tingida para o lado do **destaque**, e é isso que a regra corrige.
  - Contraste nos candidatos: tinta `#14122B` ≈ 16,8:1; tinta suave `#4D4B63` ≈ 7,7:1 (AAA).
- **Tinta:** mantenha `#14122B` (h 285°, já análoga ao marinho).
- **30% marinho na prática:** a Torre, os títulos e, se a prancha pedir, um rodapé em marinho. Não ponha a Torre sobre fundo marinho.
- **3D:** o estúdio tem uma luz "chão porcelana" (`studioScene` em `TorreScene.tsx`) e a sombra usa a cor da tinta. Atualize ambas para o fundo escolhido.
- Fontes da pesquisa (cite na prancha):
  - [NN/g: cor e design](https://www.nngroup.com/articles/color-enhance-design/)
  - [Harmonias de cor para web](https://inventivehq.com/blog/color-harmonies-guide-web-design)
  - [UX Planet: regra 60-30-10](https://uxplanet.org/the-60-30-10-rule-a-foolproof-way-to-choose-colors-for-your-ui-design-d15625e56d25)
  - [Neutros tingidos em OKLCH](https://www.impeccable.style/docs/colorize)
  - Observação: "30° para o fundo" não é regra formal. É a faixa análoga aplicada ao neutro tingido, a prática mais aceita.

**Tipografia:** confirme ou troque o par provisório (Newsreader + Hanken Grotesk). Mostre o par atual e no máximo uma alternativa.

**Miolo:** o original traçado × **Redesenho A** (retas onde a forma é reta e curvas deliberadas só onde ela é curva, como o crescente do chifre) × **Redesenho B** (facetado, só retas). Mostre os dois no emblema 2D e numa captura 3D de frente.

**Formato:**
- HTML local em `design/prancha/index.html`, com capturas reais da Torre (Playwright).
- **Não publique como artifact:** a página traz a marca de um terceiro.

**Decisão (sem parar):**
- Padrão: fundo `#F6F5F9`, botão principal âmbar com texto marinho, **Redesenho A** e a tipografia atual.
- Mude só com justificativa visível na prancha.
- A prancha fica como registro, mostrando ao autor o escolhido e as alternativas, para ele trocar depois se quiser.

### Etapa B: redesenho do miolo (linhas mais retas)
- Em `design/torre/extract_torre.py`, acrescente uma etapa de redesenho depois do traçado:
  1. simplifique cada contorno (RDP com tolerância de ~1,2 px no logo de 1080);
  2. **cure à mão** os pontos-chave: orelha e focinho do urso, divisa urso/touro, chifre, borda do touro até a base;
  3. use segmentos retos e curva só onde a variação escolhida pedir.
- Guarde os pontos curados em `design/torre/miolo-redesenho.json`. O script usa o JSON quando ele existe, para regenerar sem perder o desenho.
- Saídas com o mesmo desenho: `miolo.ts` (3D), o miolo de `marks.ts` (emblema 2D) e `src/app/icon.svg`.
- Conferência:
  - imagem de sobreposição com o traçado original, desvio máximo de ~1,5 px;
  - os dois animais legíveis no tamanho da assinatura (~258 px de altura no desktop) e no favicon.

### Etapa C: Torre de duas faces e ângulos de descanso
**Verso:**
- A metade de trás usa a mesma textura e o mesmo material, com UV planar espelhado: `u = (−x − x0)/(x1 − x0)` (a caixa da textura é simétrica). De trás, o desenho lê como o logo.
- As ameias continuam apontando para a área azul-marinho.

**Emendas laterais:** em 90° e 270°, o miolo da frente encontra o azul do verso. Avalie na gravação. Se a emenda incomodar, esmaeça o miolo para azul-marinho nos últimos ~6% do raio, linha a linha, usando `r(y)` do perfil, e confira que a vista frontal quase não muda.

**Ângulos de descanso:**
- Cada âncora declara `data-torre-face="frente|verso"` e `data-torre-facing="esquerda|direita"` (o lado do texto).
- Normal da frente: (sen θ, 0, cos θ). Normal do verso: (−sen θ, 0, −cos θ).
- Frente virada à esquerda: −35°; à direita: +35°. Verso virado à direita: 215°; à esquerda: 145°.
- Sempre o equivalente seguinte (a rotação só avança). Sequência de referência:

| Descanso | Torre | Face e direção | θ | Giro |
| --- | --- | --- | --- | --- |
| Hero | direita | frente → esquerda | −35° | — |
| 01 Empresariais | esquerda | verso → direita | 215° | +250° |
| 02 Pessoais | direita | frente → esquerda | 325° | +110° |
| 03 Investimentos | esquerda | verso → direita | 575° | +250° |
| 04 Como trabalhamos | direita | frente → esquerda | 685° | +110° |
| 05 Programas | esquerda | verso → direita | 935° | +250° |
| 06 Sócios | sai de cena (opacidade 0, recua) | — | segue girando | — |
| Assinatura | centro | frente, de frente | 1080° | +145° |

**Interpolação:**
- O giro entre descansos usa a **mesma curva da viagem** (`power3.inOut`), no lugar da rotação linear. Continua só com a rolagem.
- "Menos movimento": troca por esmaecimento, como hoje, já no ângulo do próximo descanso.

**Sócios:** uma âncora com `data-torre-hidden`. A pose esmaece e recua durante a seção e volta na assinatura.

**Arquivos:**
- `Torre.tsx`: UVs do verso.
- `choreography.ts`: `measureRests` lê face e direção e calcula θ; `poseAt` interpola a rotação com a curva.
- `TorreAnchor.tsx`: novas props.

### Etapa D: revelação horizontal (desktop) e vertical (celular)
**Regra no desktop (≥ 1024 px):** o texto entra do lado em que está, em direção ao centro.
- Coluna à direita: `translateX(48px) → 0`. Coluna à esquerda: `translateX(−48px) → 0`. Sempre com opacidade 0 → 1.
- A Torre chega do lado oposto. Na mesma transição, texto e Torre andam **no mesmo sentido**: um movimento de câmera panorâmica, não dois movimentos competindo.

**Regra no celular e no tablet empilhado (< 1024 px):** subida vertical (`translateY(24px) → 0`), como hoje. Por quê:
- abaixo de 1024 px a cena só anda na vertical (polegar, layout empilhado, a Torre esmaece em vez de cruzar);
- 48 px laterais são 12% de uma tela de 390 px;
- deslizamento lateral ali lembra animação de slide e arrisca barra de rolagem horizontal.

A coerência está no princípio ("o texto acompanha o movimento da cena"), não na direção.

**Aplicação:**
- Hero: texto à esquerda, entra da esquerda nos keyframes CSS. A entrada continua sem JavaScript.
- Blocos: lado da coluna. Assinatura e contato: título (esquerda) e dados (direita) em sentidos opostos, abrindo a partir das bordas.
- Títulos: linha a linha, com opacidade e deslocamento, **sem máscara**. Com máscara, a linha que entra pela esquerda mostraria o fim da frase primeiro.

**Uma transição só:**
- 900 ms, `cubic-bezier(0.22, 1, 0.36, 1)`, 80 ms entre itens;
- `overflow-x: clip` nas seções;
- com "menos movimento", só opacidade.

**Implementação:** `Reveal.tsx` recebe `from: "left" | "right"` (vem do lado da coluna) e marca `data-reveal-from`. O CSS em `globals.css` usa `@media (min-width: 1024px)` para o horizontal.

Skills: `/animate` (curva, duração, interrupção) e `/animation-performance` (só `transform`/`opacity`, no compositor).

### Etapa E: blocos 02 a 06 e o ritmo da página
**Conteúdo:** siga o mapa da MEMORIA (seção 3).
- 02 Finanças Pessoais: orçamento; saída de dívidas; reserva e metas.
- 03 Investimentos: perfil e objetivos; estratégia; acompanhamento. **Sem promessa de retorno**; não fale em "recomendação" antes de confirmar o registro (CVM/ANCORD/CFP).
- 04 Como trabalhamos: Organize (diagnóstico), Multiplique (estratégia), Tenha liberdade (acompanhamento), como etapas numeradas.
- 05 Programas: Imersão Torre Mestra (presencial) e Finance Pro (avançado). "6 edições" não foi confirmado: não use.
- 06 Sócios: Lucas Spinola e Gabriella Valadão.
  - Retratos provisórios elegantes (por exemplo, iniciais na serifa de títulos sobre o fundo tingido). Nada de fotos do Instagram sem autorização, nada de rosto falso.
  - Cargos e bios marcados "a confirmar".

**Estrutura:**
- Um componente só (`SplitBlock`) com variações por dados (itens, etapas numeradas, programas). Não crie um componente por seção.
- Proporção 7/5 alternada; respiro de 120svh no desktop.

**Skills:**
- `/landing-page-design`: ordem dos blocos e texto dos CTAs, cada bloco com sua mensagem de WhatsApp.
- `/design-taste-frontend`: padrão anti-template. Rode o verificador dela no navegador. Onde a regra dela bater com uma decisão do autor (por exemplo, 3D fora de site de tecnologia), a do autor vale.
- `/ui-ux-pro-max`: UX e acessibilidade.
- `vercel-react-best-practices`: revisão do código React/Next.

**Textos:** tudo em `src/content/nexfort.ts`, marcando a origem (perfis públicos × rascunho da IA).

### Etapa F: verificação (meça, não suponha)
**Ferramentas:**
- Os roteiros estão em `design/qa/`.
- Instale `playwright-core` como devDependency. Ele usa o Chrome instalado (`channel: "chrome"`, com `--enable-gpu --ignore-gpu-blocklist --use-angle=d3d11`).
- Saídas em `design/qa/saida/` (ignorado pelo Git).
- Sirva o build de produção (`npm run build` e `npx next start -p 3100`).
- Ao reiniciar, encerre o servidor antigo **pelo PID da porta 3100**, conferindo que a linha de comando é `next start`. O `TaskStop` não mata o processo filho.

**Capturas:**
- 1440×900 e 390×844, em cada descanso e no meio de cada travessia.
- Os descansos devem ser calculados pela mesma regra do app: `min(centro da seção − vh/2, topo da âncora − 8% vh)`.
- Também com "menos movimento", sem JavaScript e sem WebGL (`--disable-3d-apis`).

**Medições:**
- **Orçamento de desenho:** 0 chamadas com a página parada e com a página parada de novo depois de rolar com a roda do mouse.
- **Rolagem:** a roda do mouse precisa **mover** a página (já houve um bug do Lenis que prendia a rolagem).
- **Tarefas longas:** pelo `PerformanceObserver`; nenhuma acima de ~200 ms depois da hidratação.
- **Marcas de tempo:** `torre: estúdio (PMREM)` e `torre: compilação dos shaders`.

**Gravação:** vídeo da rolagem real com a roda no desktop e no celular. Confira alguns quadros para garantir que o WebGL saiu.

**Código:** `npm run build`, `npx tsc --noEmit` e `npx eslint src --max-warnings=0` sem erros. Sem desligar regra do React Compiler: a mutação do three.js fica em funções de módulo, como já está.

## Skills: carregue cada uma (ferramenta Skill) antes da etapa em que ela entra
| Skill | Etapa | Para quê |
| --- | --- | --- |
| `/frontend-design` | A, B | Direção estética, tipografia final e critério de desenho do redesenho do miolo |
| `/ui-ux-pro-max` | A, E | Banco de paletas e pares tipográficos (só para conferir), diretrizes de UX e acessibilidade, presets de GSAP |
| `/design-taste-frontend` | A, E, F | Padrão anti-template na construção dos blocos e o verificador dela no navegador (onde bater com decisão do autor, a do autor vale) |
| `/landing-page-design` | E | Ordem dos blocos, hero, texto e posição dos CTAs (WhatsApp por bloco), versão celular |
| `/animate` | C, D | Giro entre descansos e revelação horizontal/vertical: propósito, propriedade, curva, duração, interrupção, menos movimento |
| `/gsap-core` | C, D | API do GSAP: `gsap.matchMedia` (desktop × celular × menos movimento), `parseEase`, ScrollTrigger, SplitText |
| `/animation-performance` | C, D, F | Orçamento de quadro: só `transform`/`opacity`, compositor, 3D sob demanda, tarefas longas |
| `vercel-react-best-practices` | E, F | Revisão do código React/Next (carregamento sob demanda, fronteiras servidor/cliente, re-renderizações) |
| `/run` | F | Subir o app e capturar telas, se ajudar além dos roteiros de `design/qa/` |
| `/improve-animations` | F | Auditoria própria do movimento antes da entrega (a `/review-animations` só o autor dispara) |
| `/find-animation-opportunities` | F | Conferir que nada importante ficou sem movimento e, principalmente, **cortar excesso** |
| `/web-design-guidelines` | F | Revisão da interface: semântica, foco, contraste, acessibilidade |
| `/code-review` (nível `medium` ou `high`) | F | Revisão de correção do diff da Fase 3. Não use `max` nem `ultra` sem pedido |
| `/simplify` | F | Limpeza do código depois de tudo funcionando (reuso, simplificação) |
| `/review-animations` | Entrega | Crítica final do movimento. **Só o autor dispara** (`disable-model-invocation: true`): peça a ele no fim |
| `/find-skills` | Se precisar | Só se surgir uma necessidade que nenhuma das acima cobre |

## Critérios de aceite
- **Desenho em todo descanso:** frente ou verso, virado para o texto (exceto Sócios, sem Torre). A assinatura de frente sobre o nome, nas proporções do logo.
- **Torre:**
  - nunca descansa cortada nem atrás de texto;
  - a travessia acontece no vão entre os textos;
  - no celular, esmaece sob o texto.
- **Miolo:** com linhas retas, na variação escolhida, igual no 3D, no emblema e no favicon.
- **Revelação:** horizontal pelo lado no desktop e vertical no celular; uma vez só; sem barra de rolagem horizontal; com "menos movimento", só opacidade.
- **Paleta:**
  - 60-30-10 visível;
  - âmbar só como destaque e nunca como texto sobre fundo claro;
  - contrastes AA no mínimo (texto principal AAA);
  - o fundo do 3D casa com o fundo da página.
- **Desempenho e reservas:** as medições da Etapa F.

## Regras que não mudam
- Motion conforme o `CLAUDE.md`:
  - só `transform` e `opacity`;
  - GSAP dentro de `useGSAP({ scope })`;
  - curva `power4.out` ou `cubic-bezier(0.22, 1, 0.36, 1)`;
  - molas do Motion 300/30/1;
  - imports de `motion/react`.
- A Torre gira **só com a rolagem**. Nada se mexe sozinho, fora a Chegada.
- **Proibido:**
  - a animação do touro e do urso se chocando;
  - preto com dourado;
  - pacote de ícones, brilho (glow), vidro fosco, texto em degradê, grade bento, efeitos de cursor;
  - números, depoimentos ou promessas de retorno inventados.
- O logo continua idêntico ao original, exceto o redesenho do miolo autorizado pelo autor.
- `robots: noindex` continua. Commit só quando o autor pedir.

## Entrega
- Atualize a `MEMORIA_DO_PROJETO.md`: paleta escolhida (e as alternativas), redesenho do miolo, duas faces, revelação, blocos novos e as medições.
- Deixe o servidor de produção rodando em http://localhost:3100 para o autor ver.
- Peça ao autor para rodar **`/review-animations`**: só ele pode disparar essa skill.
- Resposta final, curta e sincera:
  - o que mudou;
  - as decisões de marca tomadas sem parar (paleta, miolo, tipografia), onde ver as alternativas na prancha e como trocar;
  - o que foi verificado, com números;
  - onde ver (URL local, prancha, capturas, vídeos);
  - o que ficou pendente;
  - sua avaliação do resultado, incluindo o que você ainda melhoraria.
