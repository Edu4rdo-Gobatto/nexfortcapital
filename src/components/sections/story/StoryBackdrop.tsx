/**
 * Fundo do palco fixado (só existe com data-pinned). Duas camadas de tela cheia:
 * a Torre (concreto azul-marinho, fixa) e o Touro (semiplano âmbar girado a 32°, cuja borda
 * é a fita de LED da fachada). O GSAP só translada o semiplano na normal do corte.
 */
export function StoryBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden group-data-pinned/stage:block"
    >
      {/* A Torre: azul profundo, com o brilho real concentrado atrás do emblema. */}
      <div className="absolute inset-0 bg-radial-[ellipse_at_68%_50%] from-navy via-navy/75 to-ink to-85%" />
      <div className="absolute inset-0 bg-radial-[circle_at_72%_52%] from-royal/40 to-transparent to-45%" />

      {/* O Touro: pivô no centro do palco, girado no ângulo da fachada. */}
      <div className="absolute top-1/2 left-1/2 size-0 rotate-[32deg]">
        <div
          data-story="cut"
          className="absolute bottom-0 left-[-75vmax] h-[150vmax] w-[150vmax] bg-ink will-change-transform"
        >
          <div className="absolute inset-0 bg-linear-to-t from-ember/24 via-crimson/12 to-crimson/6" />
          {/* Luz quente que a fita derrama sobre o lado âmbar... */}
          <div className="absolute inset-x-0 bottom-0 h-[14vmax] bg-linear-to-t from-gold/18 to-transparent" />
          {/* ...e o reflexo frio sobre o lado azul. */}
          <div className="absolute inset-x-0 top-full h-[9vmax] bg-linear-to-b from-led/7 to-transparent" />
          <div className="led-line absolute inset-x-0 bottom-0 h-px" />
        </div>
      </div>

      <div className="concrete-noise absolute inset-0" />
      {/* Bordas que se dissolvem no fundo ink da página. */}
      <div className="absolute inset-x-0 top-0 h-1/4 bg-linear-to-b from-ink to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[12%] bg-linear-to-t from-ink to-transparent" />
    </div>
  );
}
