import type { ReactNode } from "react";
import { Emblem } from "@/components/brand/Brand";
import type { Face, Facing } from "@/components/torre/choreography";
import { cn } from "@/lib/cn";

type TorreAnchorProps = {
  id: string;
  className?: string;
  /** qual face da Torre fica para o leitor: o desenho do logo (frente) ou o espelhado (verso). Sem valor: frente */
  face?: Face;
  /** o lado em que está o texto: a face fica virada para ele (22°). "centro": de frente, como o logo. Sem valor: esquerda */
  facing?: Facing;
  /** a Torre sai de cena nesta âncora (diagnóstico, dúvidas) e volta na seguinte */
  hidden?: boolean;
  /** a Torre se desmonta aqui nas três partes do método (base, corpo, coroa) */
  explode?: boolean;
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
 * Camadas: a âncora fica ABAIXO do canvas da Torre (o texto fica acima, na classe `layer`). Nada fica atrás da
 * Torre: ela é desenhada direto sobre o fundo da página.
 */
export function TorreAnchor({ id, className, face, facing, hidden, explode, fill, elev, shadow, children }: TorreAnchorProps) {
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
      {hidden ? null : <Emblem className="torre-fallback absolute inset-0 m-auto h-full w-auto" />}
      {children}
    </div>
  );
}
