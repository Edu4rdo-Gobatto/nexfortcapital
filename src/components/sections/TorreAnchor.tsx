import { Emblem } from "@/components/brand/Brand";
import { cn } from "@/lib/cn";

type TorreAnchorProps = {
  id: string;
  className?: string;
  /** fração da altura da âncora ocupada pela Torre */
  fill?: number;
  /** elevação da vista, em graus (0 = vista do logo) */
  elev?: number;
  /** sombra de contato, 0..1 */
  shadow?: number;
};

/**
 * Lugar da Torre no layout. O palco mede este espaço e leva a Torre 3D até ele; sem WebGL ou sem
 * JavaScript, o emblema 2D do logo aparece aqui no lugar dela.
 */
export function TorreAnchor({ id, className, fill, elev, shadow }: TorreAnchorProps) {
  return (
    <div
      data-torre-anchor={id}
      data-torre-fill={fill}
      data-torre-elev={elev}
      data-torre-shadow={shadow}
      aria-hidden="true"
      className={cn("relative", className)}
    >
      <Emblem className="torre-fallback absolute inset-0 m-auto h-full w-auto" />
    </div>
  );
}
