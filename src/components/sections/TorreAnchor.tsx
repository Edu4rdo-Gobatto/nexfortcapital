import type { ReactNode } from "react";
import { Emblem } from "@/components/brand/Brand";
import type { Face, Facing } from "@/components/torre/choreography";
import type { NicheTone } from "@/content/nexfort";
import { cn } from "@/lib/cn";

type TorreAnchorProps = {
  id: string;
  className?: string;
  /** qual face da Torre fica para o leitor: o desenho do logo (frente) ou o espelhado (verso). Sem valor: frente */
  face?: Face;
  /** o lado em que está o texto: a face fica virada para ele (22°). "centro": de frente, como o logo. Sem valor: esquerda */
  facing?: Facing;
  /** a Torre sai de cena nesta âncora (sinais, diagnóstico, Sócios, dúvidas) e volta na seguinte */
  hidden?: boolean;
  /** a Torre se desmonta aqui nas três partes do método (base, corpo, coroa) */
  explode?: boolean;
  /** nicho colorido atrás da Torre (um arco): a cor da frente do bloco, o degradê do logo ("sun") ou o lilás neutro */
  niche?: NicheTone;
  /** fração da altura da âncora ocupada pela Torre */
  fill?: number;
  /** elevação da vista, em graus (0 = vista do logo) */
  elev?: number;
  /** sombra de contato, 0..1 */
  shadow?: number;
  /** o que fica sobre a Torre nesta âncora (os nomes das etapas, no bloco do método) */
  children?: ReactNode;
};

/**
 * Lugar da Torre no layout. O palco mede este espaço e leva a Torre 3D até ele; sem WebGL ou sem
 * JavaScript, o emblema 2D do logo aparece aqui no lugar dela (menos na âncora de "fora de cena").
 * Os padrões (frente, esquerda) ficam em choreography.ts, que lê os atributos data-torre-*.
 *
 * Camadas: a âncora fica ABAIXO do canvas da Torre (o texto fica acima, na classe `layer`). Por isso o nicho
 * colorido pode morar aqui dentro: a Torre 3D é desenhada na frente dele.
 */
export function TorreAnchor({ id, className, face, facing, hidden, explode, niche, fill, elev, shadow, children }: TorreAnchorProps) {
  return (
    <div
      data-torre-anchor={id}
      data-torre-face={face}
      data-torre-facing={facing}
      data-torre-hidden={hidden ? "" : undefined}
      data-torre-explode={explode ? "" : undefined}
      data-torre-fill={fill}
      data-torre-elev={elev}
      data-torre-shadow={shadow}
      aria-hidden="true"
      className={cn("relative", className)}
    >
      {niche ? <span className="torre-niche" data-tone={niche} /> : null}
      {hidden ? null : <Emblem className="torre-fallback absolute inset-0 m-auto h-full w-auto" />}
      {children}
    </div>
  );
}
