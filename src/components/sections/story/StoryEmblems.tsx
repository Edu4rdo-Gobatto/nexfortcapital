import { EMBLEM_SIZE } from "@/components/brand/NexfortLogo";
import { cn } from "@/lib/utils";

/**
 * Camadas da logo original, recortadas por design/motion/extract_logo.py no mesmo enquadramento:
 * empilhadas, formam a logo inteira, pixel a pixel.
 */
const TOWER_SRC = "/brand/nexfort-torre-base.png"; // a torre, com o miolo em azul
const CORE_SRC = "/brand/nexfort-miolo.png"; // o urso e o touro

/**
 * Mesma caixa para os dois emblemas: no modo fixado (pin) eles ocupam a mesma célula
 * e se sobrepõem pixel a pixel, então o miolo acende exatamente dentro da torre.
 */
const EMBLEM_BOX =
  "relative aspect-[774/1458] h-60 shrink-0 sm:h-72 lg:h-96 group-data-pinned/stage:h-[min(64svh,38rem)]";

/** Camadas animadas pelo GSAP só ganham will-change enquanto o palco está fixado. */
const ANIMATED = "group-data-pinned/stage:will-change-[opacity,transform]";

const LAYER = "absolute inset-0 size-full object-contain";

function Layer({ src, className, ...rest }: { src: string; className?: string; "data-story"?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- camadas pequenas sobrepostas pixel a pixel; next/image não ajuda aqui.
    <img
      src={src}
      width={EMBLEM_SIZE.width}
      height={EMBLEM_SIZE.height}
      alt=""
      decoding="async"
      className={cn(LAYER, className)}
      {...rest}
    />
  );
}

/**
 * A Torre: a logo original sem o miolo, com o brilho azul.
 * Fora do modo fixado aparece pronta; no palco fixado o GSAP a faz subir e acender (story/timeline.ts).
 */
export function TowerEmblem({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn(EMBLEM_BOX, className)}>
      <div
        data-story="halo-tower"
        className={cn(
          "absolute inset-[-32%] bg-radial from-royal-glow/45 via-royal/20 to-transparent to-70%",
          ANIMATED,
        )}
      />
      {/* Brilho âmbar do miolo: existe só no palco fixado (no fluxo normal ele vive no BullEmblem). */}
      <div
        data-story="halo-bull"
        className="absolute inset-[-42%] hidden bg-radial from-gold/40 via-ember/16 to-transparent to-70% will-change-[opacity,transform] group-data-pinned/stage:block"
      />
      <Layer data-story="rook-mass" src={TOWER_SRC} className={ANIMATED} />
    </div>
  );
}

/**
 * O miolo da logo (o urso e o touro), com um halo difuso de calor.
 * No fluxo normal traz a própria torre e o próprio brilho; no palco fixado só o miolo aparece,
 * sobreposto à TowerEmblem, e o GSAP o acende dentro dela.
 */
export function BullEmblem({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn(EMBLEM_BOX, className)}>
      <div className="absolute inset-[-42%] bg-radial from-gold/35 via-ember/14 to-transparent to-70% group-data-pinned/stage:hidden" />
      <Layer src={TOWER_SRC} className="group-data-pinned/stage:hidden" />

      {/* Calor que vaza: o miolo desfocado (o filtro é estático; só a opacidade da camada muda). */}
      <Layer data-story="bull-bloom" src={CORE_SRC} className={cn("opacity-60 blur-md", ANIMATED)} />

      <div data-story="bull" className={cn("absolute inset-0", ANIMATED)}>
        <div data-story="bull-body" className="absolute inset-0">
          <Layer src={CORE_SRC} />
        </div>
      </div>
    </div>
  );
}
