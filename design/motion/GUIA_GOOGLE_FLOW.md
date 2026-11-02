# Guia: motion da logo Nexfort no Google Flow (v2: corrida rápida)

Animação: o touro e o urso disparam um contra o outro (**no máximo 2 s**), **se chocam sem pausa**, o flash explode no mesmo instante e revela a Torre.

## Como o trabalho é dividido

| Parte | Quem faz |
|---|---|
| Corrida, choque e flash | **Google Flow** (vídeo) |
| Ritmo final: acelerar até ≤ 2 s e cortar qualquer pausa | **Claude** (ffmpeg) |
| A Torre surgindo do flash | **Código do site** (emblema vetorial real) |

## O que mudou em relação ao teste anterior

| Problema no teste | Causa | Correção |
|---|---|---|
| Corrida longa | Os bichos começavam longe, na borda da tela | Novo frame **`inicio-perto.png`**, com os dois a meio caminho do centro |
| Pausa antes do choque | O **último frame** (`colisao.png`) faz o Veo frear para "pousar" na pose parada | **Não usar último frame.** Só o primeiro. |
| Ritmo lento | O Flow sempre gera clipes de 8 s e distribui a ação ao longo deles | O prompt concentra tudo nos primeiros ~3 s e, no pós, a corrida é acelerada para **≤ 2 s** |

> **Garantia de tempo:** nenhum prompt garante a duração exata. A garantia vem do pós: eu acelero a corrida para no máximo 2 s e corto qualquer frame parado entre o contato e o flash. O prompt só precisa entregar uma corrida e um choque bonitos.

---

## 1. Antes de começar

- Conta Google com o plano **Google AI Pro** ou **Ultra**.
- Frame em `design/motion/frames/`:
  - **`inicio-perto.png`**: o único que será usado.
  - `inicio.png` e `colisao.png`: **não use**.

## 2. Configurar o Flow

1. Acesse **https://labs.google/fx/tools/flow** e abra o projeto `Nexfort – Intro` (ou crie um com **New project**).
2. Escolha o modo **Frames to Video**.
3. Nas configurações:
   - **Aspect ratio:** Landscape **16:9**
   - **Outputs per prompt:** **2**
   - **Modelo:** **Veo 3.1 – Fast** para testar e **Veo 3.1 – Quality** para a versão final.
4. **Primeiro frame:** envie `inicio-perto.png`.
5. **Último frame:** **deixe vazio.** Se já houver uma imagem nele, remova.

## 3. Prompt (copie e cole)

```
Premium 2D motion graphic in a flat vector style, on a solid deep navy-black background that stays perfectly uniform for the whole shot. The camera is completely fixed like a tripod shot: no zoom, no push-in, no pan, no shake; the framing never changes.

Fast, explosive action. From the very first frame, the royal-blue bull on the left and the orange-gold bear on the right, exactly as drawn in the first frame (flat colored silhouettes with a thin glowing white outline), sprint at full speed toward each other with a fast 2D running cycle, legs clearly animated. They cover the distance in under two seconds.

They slam into each other head-on at the exact center at full speed, with no slowing down, no hesitation, no standoff and no pause before the impact. At the exact instant of contact, a bright burst of warm white-gold light explodes from the impact point and instantly grows until white light fills the entire frame. The rest of the video stays on that white light.

Both animals keep their exact shapes, colors and proportions until the impact. Sharp edges, solid colors, no texture, no extra animals, no tower, no other objects, no text.
```

> Se o vídeo vier com som, não tem problema: o áudio é removido depois e o site toca o vídeo mudo.

## 4. Como avaliar cada resultado

- [ ] Eles **já começam correndo** (sem ficar parados no início).
- [ ] O choque acontece **em alta velocidade, sem frear** antes.
- [ ] O flash nasce **no instante do contato**.
- [ ] A câmera fica parada (sem zoom).
- [ ] O touro e o urso mantêm a forma e as cores até o choque.

**Não reprove pela duração:** se a corrida levar 3–4 s, eu acelero para ≤ 2 s. Reprove por **pausa ou freada** antes do choque, porque acelerar não resolve isso (a pausa só fica mais curta). Também ignore tudo o que vem depois do flash.

## 5. Ajustes rápidos (acrescente no fim do prompt)

| Problema | Linha para acrescentar |
|---|---|
| Ficam parados no começo | `The animals are already running at full speed in the first frame of the video; there is no standing still.` |
| Freiam ou se encaram antes do choque | `They never stop or look at each other before the hit; the collision happens at top speed, like two cars crashing.` |
| O flash demora a aparecer | `The light explosion happens in the same frame as the contact, with zero delay.` |
| Ainda está lento | `Everything happens very quickly: the impact occurs at about two seconds into the video.` |
| Ficou 3D ou realista | `Strictly flat 2D vector shapes, like an After Effects shape-layer animation. No 3D, no fur, no realistic lighting.` |
| Dá zoom | `Static wide shot. The bull and the bear stay the same size on screen from start to finish.` |
| O fundo muda (degradê, fumaça, chão) | `The background is one flat dark color: no gradient, no vignette, no smoke, no floor.` |
| Aparece uma torre ou outro objeto | `Only the bull, the bear and the light flash appear in this video.` |

Ajuste com o **Fast** em 2 ou 3 rodadas. Quando um resultado agradar, gere de novo com o **Quality**.

## 6. Baixar e entregar

1. No clipe escolhido, clique em **Download → Upscaled (1080p)** (MP4).
2. Salve como **`design/motion/flow-v2.mp4`**. Se tiver mais de um bom, use `flow-v3.mp4` e assim por diante.
3. Avise o Claude.

## 7. Como o vídeo entra no site (status: integrado com o `flow-v2.mp4`)

O vídeo não toca sozinho: ele virou uma **abertura em rolagem** no topo da página (`src/components/brand/BrandPrologue.tsx`). Cada pedaço de rolagem avança um quadro, e rolar para cima volta a cena.

- **Corte da pausa:** o `flow-v2.mp4` foi medido quadro a quadro (posição do touro e do urso, movimento, brilho). A pausa em que os dois se encaram saiu: ficaram a corrida (0–12), o choque (26–30 e 33–34) e o flash com a explosão (44–78). Os pontos de corte têm os bichos na mesma posição, então não há salto.
- **Quadros:** 55 imagens WebP em `public/motion/prologue/` (1920px no desktop e 1280px no celular, 1,4 MB e 0,7 MB no total), com o fundo ajustado para o `#060913` do site.
- **Final:** a explosão vira uma luz que cobre a tela e se recolhe no centro. Dela nasce a Torre vetorial real, com "NEXFORT CAPITAL" e a linha de atuação embaixo, como na logo original. Depois, a Hero entra animada.

**Para trocar o vídeo no futuro:**
1. Salve o novo MP4 em `design/motion/`.
2. Ajuste `SEGMENTS` em `design/motion/build_prologue.py` com os quadros que devem ficar.
3. Rode `python design/motion/build_prologue.py design/motion/<video>.mp4`.
4. Atualize `FRAME_COUNT` em `BrandPrologue.tsx` com o número que o script imprimir.
