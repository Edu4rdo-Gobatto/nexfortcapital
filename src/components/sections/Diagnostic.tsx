import { MIOLO_CLIP_ID, SILHOUETTE_ID } from "@/components/brand/Brand";
import { EMBLEM } from "@/components/brand/marks";
import { PART_LEVELS } from "@/components/torre/parts";
import { diagnostic, WHATSAPP_BASE } from "@/content/nexfort";
import { DiagnosticQuiz } from "./DiagnosticQuiz";
import { Reveal } from "./Reveal";
import { TorreAnchor } from "./TorreAnchor";

const [, , EMBLEM_WIDTH, EMBLEM_HEIGHT] = EMBLEM.viewBox.split(" ").map(Number);

/**
 * Diagnóstico de 1 minuto, logo depois do método: a pessoa acabou de ver as três partes da Torre e descobre em
 * qual está. É a única sala escura da página (marinho, o 30% da paleta) e a única em que se faz algo além de
 * ler. A Torre 3D sai de cena aqui: o medidor é a Torre do logo em 2D, que enche até a etapa do resultado.
 *
 * Este componente fica no servidor e passa ao questionário (cliente) só o que ele usa: os caminhos pesados do
 * logo continuam fora do pacote do navegador, referenciados pelos ids definidos uma vez em BrandSymbols.
 */
export function Diagnostic() {
  const titleId = `${diagnostic.id}-titulo`;
  return (
    <section
      data-torre-section=""
      id={diagnostic.id}
      aria-labelledby={titleId}
      className="layer on-navy flex items-center bg-navy px-(--gutter) py-24 text-paper lg:min-h-svh lg:py-32"
    >
      <TorreAnchor id={diagnostic.id} hidden fill={0.5} className="pointer-events-none absolute inset-0" />
      <div className="relative mx-auto grid w-full max-w-(--page-max) grid-cols-1 gap-y-14 lg:grid-cols-12 lg:gap-x-8">
        <Reveal from="left" className="lg:col-span-5">
          <p data-reveal-item="" className="eyebrow">
            {diagnostic.area}
          </p>
          <h2 id={titleId} data-reveal-title="" className="display display-section mt-5">
            {diagnostic.title}
          </h2>
          <p data-reveal-item="" className="mt-7 max-w-[40ch] text-lg leading-relaxed text-paper/80">
            {diagnostic.lead}
          </p>
          <p data-reveal-item="" className="mt-6 max-w-[40ch] text-sm leading-relaxed text-paper/65">
            {diagnostic.privacy}
          </p>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <DiagnosticQuiz
            questions={diagnostic.questions}
            results={diagnostic.results}
            levels={PART_LEVELS}
            ui={diagnostic.ui}
            message={diagnostic.message}
            whatsappBase={WHATSAPP_BASE}
            tower={{ width: EMBLEM_WIDTH, height: EMBLEM_HEIGHT, silhouetteId: SILHOUETTE_ID, clipId: MIOLO_CLIP_ID }}
          />
        </div>
      </div>
    </section>
  );
}
