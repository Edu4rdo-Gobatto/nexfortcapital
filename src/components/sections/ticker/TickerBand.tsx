"use client";

import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Segundos para uma cópia inteira da lista atravessar a faixa (~50 px/s no desktop, ~40 px/s no celular). */
const LOOP_SECONDS = 48;
/** Velocidade de scroll (px/s) que soma 1 ao timeScale do loop. */
const VELOCITY_PER_STEP = 260;
/** Teto do timeScale nos dois sentidos (rolar para cima faz a faixa correr ao contrário). */
const MAX_TIME_SCALE = 5;
/** Duração da volta à velocidade de cruzeiro depois do impulso do scroll. */
const SETTLE_SECONDS = 1.4;

const PAUSE_LABEL = "Pausar a animação da faixa";
const RESUME_LABEL = "Retomar a animação da faixa";

type TickerBandProps = {
  /** Nome acessível da região. */
  label: string;
  /** As duas cópias da lista: a real e a decorativa (aria-hidden). */
  children: ReactNode;
};

/**
 * Casca interativa da faixa diagonal: loop horizontal GSAP acoplado à velocidade do scroll,
 * pausado fora da tela, com botão de pausa (WCAG 2.2.2). Sem animação quando o sistema pede menos movimento.
 */
export function TickerBand({ label, children }: TickerBandProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<gsap.core.Tween | null>(null);
  const inViewRef = useRef(false);
  const userPausedRef = useRef(false);
  const [isPaused, setIsPaused] = useState(false);

  /** Toca apenas quando a faixa está visível e o usuário não pausou. */
  function syncPlayback() {
    loopRef.current?.paused(userPausedRef.current || !inViewRef.current);
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia(); // criado no contexto do useGSAP: revertido automaticamente
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const section = sectionRef.current;
        const track = trackRef.current;
        if (!section || !track) return;

        // Marquee: ease "none" porque a faixa precisa de velocidade constante (uma curva "pulsaria" a cada volta).
        // -50% = exatamente uma cópia da lista, então o recomeço é invisível.
        const loop = gsap.to(track, { xPercent: -50, duration: LOOP_SECONDS, ease: "none", repeat: -1, paused: true });
        // Começa mil voltas adiante: tocando ao contrário (scroll para cima) nunca chega ao tempo 0, onde travaria.
        loop.totalTime(LOOP_SECONDS * 1000);
        loopRef.current = loop;

        let settle: gsap.core.Tween | undefined;
        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => {
            inViewRef.current = self.isActive;
            syncPlayback();
          },
          onUpdate: (self) => {
            // Impulso proporcional à velocidade do scroll e no mesmo sentido; depois desacelera até o cruzeiro.
            const boost = gsap.utils.clamp(-MAX_TIME_SCALE, MAX_TIME_SCALE, 1 + self.getVelocity() / VELOCITY_PER_STEP);
            loop.timeScale(boost);
            settle = gsap.to(loop, { timeScale: 1, duration: SETTLE_SECONDS, ease: "power4.out", overwrite: true });
          },
        });
        // Estado inicial síncrono (página recarregada com a faixa já na tela); o onToggle cuida do resto.
        inViewRef.current = ScrollTrigger.isInViewport(section);
        syncPlayback();

        // As fitas de LED acendem a partir de pontas opostas quando a faixa entra na tela.
        gsap.from("[data-ticker-led]", {
          scaleX: 0,
          opacity: 0,
          duration: 1.6,
          ease: "power4.out",
          stagger: 0.18,
          scrollTrigger: { trigger: section, start: "top 85%", once: true },
        });

        return () => {
          settle?.kill();
          loopRef.current = null;
          inViewRef.current = false;
        };
      });
    },
    { scope: sectionRef },
  );

  function togglePause() {
    userPausedRef.current = !userPausedRef.current;
    setIsPaused(userPausedRef.current);
    syncPlayback();
  }

  return (
    <section
      ref={sectionRef}
      aria-label={label}
      data-section="diagonal_ticker"
      className={cn(
        "relative overflow-x-clip [--bleed:2rem] sm:[--bleed:3rem] lg:[--bleed:4rem]",
        // Respiro vertical >= quanto a faixa girada sobe/desce na borda da tela (50vw · sen θ), com folga para o brilho.
        "py-9 sm:py-[calc(1.8vw+1rem)] lg:py-[calc(2.2vw+0.75rem)]",
      )}
    >
      {/* Faixa mais larga que a tela (--bleed de cada lado): as pontas giradas nunca aparecem. */}
      <div className="relative -mx-(--bleed) rotate-[-1.5deg] sm:-rotate-2 lg:rotate-[-2.5deg]">
        <div data-ticker-led className="led-line relative z-10 h-px origin-left" />
        <div className="concrete-noise relative overflow-hidden bg-navy px-(--bleed) py-4 sm:py-5 lg:py-6">
          <div
            ref={trackRef}
            className="flex w-max motion-safe:will-change-transform motion-reduce:w-auto motion-reduce:px-5 sm:motion-reduce:px-8"
          >
            {children}
          </div>
          {/* Fundo do controle de pausa: sólido sob o botão e no excedente (cobre a fresta da rotação), depois esmaece. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-[calc(var(--bleed)+7rem)] bg-linear-to-l from-navy from-[calc(var(--bleed)+3.5rem)] to-transparent motion-reduce:hidden"
          />
        </div>
        <div data-ticker-led className="led-line relative z-10 h-px origin-right" />

        <button
          type="button"
          onClick={togglePause}
          aria-label={isPaused ? RESUME_LABEL : PAUSE_LABEL}
          className={cn(
            "absolute top-1/2 right-[calc(var(--bleed)+0.75rem)] z-20 grid size-10 -translate-y-1/2 place-items-center text-led/80 hover:text-gold",
            "transition-[scale] duration-200 ease-out-expo active:scale-90",
            "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:hidden",
          )}
        >
          <span className="clip-chamfer absolute inset-0 bg-white/15 [--cut:9px]" />
          <span className="clip-chamfer absolute inset-px bg-navy [--cut:8px]" />
          {isPaused ? <Play className="relative size-3.5" /> : <Pause className="relative size-3.5" />}
        </button>
      </div>
    </section>
  );
}
