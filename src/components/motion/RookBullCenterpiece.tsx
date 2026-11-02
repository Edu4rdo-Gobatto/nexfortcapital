"use client";

import { useEffect, useEffectEvent, useId, useRef, useState, type PointerEvent } from "react";
import {
  cancelFrame,
  frame,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type FrameData,
} from "motion/react";
import { Pause, Play } from "lucide-react";
import { CornerTicks, LedFloor, RoyalHalo } from "@/components/motion/rook-bull/Ambient";
import { BullLayer } from "@/components/motion/rook-bull/BullLayer";
import {
  CHART_CYCLE_SECONDS,
  PARALLAX,
  POINTER_REACH,
  POINTER_SPRING,
  POINTER_VERTICAL,
} from "@/components/motion/rook-bull/constants";
import { MarketChart } from "@/components/motion/rook-bull/MarketChart";
import { TelemetryCards } from "@/components/motion/rook-bull/TelemetryCards";
import { TowerLayer } from "@/components/motion/rook-bull/TowerLayer";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const DESCRIPTION =
  "Emblema da Nexfort Capital: uma torre de xadrez azul-marinho, símbolo de proteção e gestão, com um touro dourado, laranja e vermelho esculpido na base, símbolo da multiplicação do patrimônio.";

const PAUSE_LABEL = "Pausar animação do emblema";
const RESUME_LABEL = "Retomar animação do emblema";

/** Maior passo de tempo aceito por quadro (s): evita saltos ao voltar de uma aba em segundo plano. */
const MAX_FRAME_STEP = 0.05;

/**
 * O coração visual do site: a Torre (governança, proteção) com o Touro (multiplicação) esculpido na base.
 * 1. Entrada: as linhas da torre se desenham em ordem de construção e o azul-marinho acende.
 * 2. Ignição: 0.4s depois, uma onda de calor percorre o touro e micro candles de alta sobem pela coluna.
 * 3. Física do ponteiro: torre pesada (6px), touro enérgico (14px + leve rotação 3D), em camadas.
 * 4. Botão de pausa (WCAG 2.2.2): congela o laço contínuo (gráfico, partículas, flutuação dos cards).
 */
export function RookBullCenterpiece({ className }: { className?: string }) {
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, "");
  const stageRef = useRef<HTMLDivElement>(null);
  // Ao vivo (null no servidor e na hidratação): só decide transições, laços e handlers, nunca markup.
  const reduce = usePrefersReducedMotion();
  const started = useInView(stageRef, { once: true, amount: 0.3 });
  const inView = useInView(stageRef);

  const [ignited, setIgnited] = useState(false);
  const [paused, setPaused] = useState(false);

  // Física do ponteiro: um vetor normalizado (−1…1) alimenta molas e, delas, cada camada.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, POINTER_SPRING);
  const springY = useSpring(pointerY, POINTER_SPRING);
  const towerX = useTransform(springX, (value) => value * PARALLAX.tower);
  const towerY = useTransform(springY, (value) => value * PARALLAX.tower);
  const bullX = useTransform(springX, (value) => value * PARALLAX.bull);
  const bullY = useTransform(springY, (value) => value * PARALLAX.bull);
  const bullRotateY = useTransform(springX, (value) => value * PARALLAX.tiltY);
  const bullRotateX = useTransform(springY, (value) => value * -PARALLAX.tiltX);

  // Movimento reduzido ligado com a página aberta: as camadas voltam ao repouso na hora, sem mola.
  useEffect(() => {
    if (!reduce) return;
    pointerX.jump(0);
    pointerY.jump(0);
    springX.jump(0);
    springY.jump(0);
  }, [reduce, pointerX, pointerY, springX, springY]);

  // Laço único de quadros (gráfico, partículas, flutuação). Só roda na tela, sem movimento reduzido e sem pausa.
  const chartProgress = useMotionValue(0);
  const particleClock = useMotionValue(0);
  const floatClock = useMotionValue(0);

  const advance = useEffectEvent((deltaMs: number) => {
    const dt = Math.min(deltaMs / 1000, MAX_FRAME_STEP);
    chartProgress.set((chartProgress.get() + dt / CHART_CYCLE_SECONDS) % 1);
    if (!ignited) return;
    particleClock.set(particleClock.get() + dt);
    floatClock.set(floatClock.get() + dt);
  });

  const looping = inView && reduce === false && !paused;

  useEffect(() => {
    if (!looping) return;
    const step = ({ delta }: FrameData) => advance(delta);
    frame.update(step, true);
    return () => cancelFrame(step);
  }, [looping]);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (reduce !== false || event.pointerType === "touch" || !stage) return;
    const rect = stage.getBoundingClientRect();
    let nx = (event.clientX - (rect.left + rect.width / 2)) / ((rect.width / 2) * POINTER_REACH);
    let ny = (event.clientY - (rect.top + rect.height / 2)) / ((rect.height / 2) * POINTER_REACH);
    const length = Math.hypot(nx, ny);
    if (length > 1) {
      nx /= length;
      ny /= length;
    }
    pointerX.set(nx);
    pointerY.set(ny * POINTER_VERTICAL);
  }

  function handlePointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div
      className={cn("w-full", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="@container mx-auto w-full max-w-136">
        {/* --tower-w: em containers estreitos a torre ocupa ~2/3 da largura e os cards viram grade 2×2;
            com ≥ 29rem ela encolhe o suficiente para os cards de 8.5rem ladearem a coluna sem cobrir o emblema. */}
        <div className="grid gap-y-4 [--stage-pb:2rem] [--stage-pt:1.75rem] [--tower-w:min(66cqw,17.5rem)] @min-[29rem]:[--tower-w:min(19.5rem,calc((50cqw-9.25rem)*2.95))]">
          <motion.div
            ref={stageRef}
            role="img"
            aria-label={DESCRIPTION}
            className="relative isolate col-start-1 row-start-1 overflow-clip pt-(--stage-pt) pb-(--stage-pb)"
            initial="hidden"
            animate={started ? "drawn" : "hidden"}
          >
            <CornerTicks />
            <MarketChart uid={uid} progress={chartProgress} reduce={reduce} />

            <div className="relative mx-auto aspect-2/3 w-(--tower-w) perspective-[1000px]">
              <RoyalHalo reduce={reduce} />
              <LedFloor reduce={reduce} />
              <motion.div
                className="absolute inset-0 motion-safe:pointer-fine:will-change-transform"
                style={{ x: towerX, y: towerY }}
              >
                <TowerLayer uid={uid} reduce={reduce} />
              </motion.div>
              {/* Camada própria também no toque: o laço das partículas repinta só aqui, sem refiltrar a torre. */}
              <motion.div
                className="absolute inset-0 origin-[50%_70%] motion-safe:will-change-transform"
                style={{ x: bullX, y: bullY, rotateX: bullRotateX, rotateY: bullRotateY }}
              >
                <BullLayer
                  uid={uid}
                  reduce={reduce}
                  ignited={ignited}
                  clock={particleClock}
                  onIgnite={() => setIgnited(true)}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Pausa do laço contínuo (WCAG 2.2.2). Irmão do palco, não filho: fora do role="img" (que achataria o botão)
              e do overflow-clip (que cortaria o foco). Mesma célula, no canto superior direito: acima das ameias e ao
              lado da coluna, nunca sobre o emblema. */}
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-label={paused ? RESUME_LABEL : PAUSE_LABEL}
            className={cn(
              "relative z-10 col-start-1 row-start-1 m-1 grid size-8 cursor-pointer place-items-center self-start justify-self-end text-led/80 hover:text-gold",
              "transition-[color,scale] duration-200 ease-out-expo active:scale-90",
              "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold motion-reduce:hidden",
            )}
          >
            <span aria-hidden="true" className="clip-chamfer absolute inset-0 bg-white/15 [--cut:7px]" />
            <span aria-hidden="true" className="clip-chamfer absolute inset-px bg-concrete [--cut:6px]" />
            {paused ? <Play className="relative size-3.5" /> : <Pause className="relative size-3.5" />}
          </button>

          <TelemetryCards
            className="col-start-1 row-start-2 @min-[29rem]:row-start-1"
            ignited={ignited}
            reduce={reduce}
            clock={floatClock}
          />
        </div>
      </div>
    </div>
  );
}
