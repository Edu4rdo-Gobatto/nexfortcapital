# QA da página (Playwright)

Roteiros usados para verificar a Torre e a página com números, num navegador de verdade e com a placa de vídeo.

## Antes de usar

1. O `playwright-core` já está nas devDependencies (`npm install`). Ele usa o Chrome já instalado (`channel: "chrome"`), sem baixar navegador.
2. Para gravar vídeo (`gravacao.mjs`), o Playwright precisa do ffmpeg dele: `npx playwright-core install ffmpeg` (1,6 MB, uma vez por versão do `playwright-core`).
3. Sirva o build de produção: `npm run build` e depois `npx next start -p 3100`.
4. Para reiniciar o servidor, encerre o processo da porta 3100 pelo PID, conferindo que a linha de comando é `next start`.
   Nunca rebuilde com o servidor de pé: o `.next` muda por baixo dele.
5. Se houver um `next start` antigo que não dá para encerrar, builde e sirva em outra pasta e outra porta:
   `NEXT_DIST_DIR=.next-previa npx next build` e `NEXT_DIST_DIR=.next-previa npx next start -p 3102`.
   O Next acrescenta a pasta nova ao `include` do `tsconfig.json`: desfaça com `git checkout -- tsconfig.json`.

Tudo é gravado em `design/qa/saida/`, ignorado pelo Git.

## Roteiros

| Comando | O que faz |
| --- | --- |
| `node design/qa/capturas.mjs [url] [--reduce] [--only=desktop\|celular] [--pasta=nome]` | Capturas em cada descanso da Torre e no meio de cada travessia, desktop e celular (`--reduce` simula "menos movimento"). Confere por número que a Torre cabe na tela e não fica atrás do texto |
| `node design/qa/torre-detalhe.mjs [url] --rest=assinatura,hero [--meio=id] [--lockup=1700 --vw=2000 --vh=1300]` | Recorte da Torre num descanso (ou no meio da travessia), em resolução maior; `--lockup` amplia a assinatura para ver o miolo de frente |
| `node design/qa/revelacao.mjs` | Mede a revelação: estado inicial e final por largura de tela (±48 px no desktop, 24 px vertical no celular, só opacidade com menos movimento), uma vez só, sem barra horizontal, texto e Torre no mesmo sentido |
| `node design/qa/orcamento.mjs` | Chamadas de desenho parado, rolando com a roda e parado de novo (esperado: 0 parado), mais as tarefas longas |
| `node design/qa/tempos.mjs` | Marcas de tempo da Torre (estúdio PMREM, compilação dos shaders) e tarefas longas do carregamento |
| `node design/qa/reservas.mjs` | Sem JavaScript e sem WebGL: emblema 2D nas âncoras e texto legível |
| `node design/qa/gravacao.mjs` | Vídeo da rolagem real (desktop e celular) |
| `node design/qa/quadros.mjs [video] [segundos]` | Quadros de um vídeo, para conferir que o WebGL saiu na gravação |
| `node design/qa/perfil-cpu.mjs` | Perfil de CPU do carregamento: funções mais pesadas e suas pilhas |
| `node design/qa/prancha.mjs [--largura=1280]` | Confere a prancha de decisões (`design/prancha/index.html`): captura cada quadro, acusa imagem quebrada e barra horizontal |

Todos aceitam a URL como primeiro argumento (padrão: `http://localhost:3100/`). As peças comuns (argumentos, Chrome com GPU, espera do palco)
estão em `lib.mjs`. Os descansos da Torre **não são recalculados** aqui: o app grava o dele em `data-torre-rest` em cada âncora
(a cada medição) e os roteiros leem de lá, então não há como a regra e os roteiros divergirem.

## Prancha de decisões

`design/prancha/index.html` (uso interno, traz a marca de um terceiro: não publicar). As imagens dela vêm destas capturas:
`python design/prancha/montar_imagens.py` converte para WebP em `design/prancha/img/`.
Os SVG dos três miolos e as sobreposições vêm de `python design/torre/extract_torre.py --check design/qa/saida/miolo` e
`python design/torre/curar_miolo.py --check design/qa/saida/miolo`.
