"use client";

import { AnimatePresence, domAnimation, LazyMotion, MotionConfig } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import type { DiagnosticQuestion, DiagnosticResult, TorrePart } from "@/content/nexfort";

/** Física padrão do projeto (CLAUDE.md): mola 300 / 30 / 1. */
const SPRING = { type: "spring", stiffness: 300, damping: 30, mass: 1 } as const;
/** Saída: só opacidade, curta, na curva padrão. A pergunta nova não espera a antiga terminar de deslizar. */
const EXIT = { duration: 0.14, ease: [0.22, 1, 0.36, 1] } as const;
/** Quanto a pergunta desliza ao entrar (px), no sentido da navegação. */
const SLIDE = 28;

type Props = {
  questions: readonly DiagnosticQuestion[];
  results: Record<TorrePart, DiagnosticResult>;
  /** até onde cada etapa enche a Torre, de baixo para cima (0..1) */
  levels: Record<TorrePart, number>;
  ui: { progress: string; back: string; resultLabel: string; send: string; restart: string; disclaimer: string };
  message: { opening: string; stage: string; closing: string };
  whatsappBase: string;
  /** a Torre do logo em 2D: caixa do desenho e os ids da silhueta e do recorte (definidos uma vez na página) */
  tower: { width: number; height: number; silhouetteId: string; clipId: string };
};

/** A etapa em que a pessoa está: base firme só com 3 de 4; corpo completo só com 4 de 4 (regra em nexfort.ts). */
function stageOf(questions: readonly DiagnosticQuestion[], answers: readonly number[]): TorrePart {
  let base = 0;
  let body = 0;
  questions.forEach((question, i) => {
    const score = question.options[answers[i]]?.score ?? 0;
    if (question.part === "base") base += score;
    else if (question.part === "body") body += score;
  });
  if (base < 3) return "base";
  if (body < 4) return "body";
  return "crown";
}

/** A mensagem do WhatsApp: a etapa e cada resposta, para a conversa já começar no contexto. */
function buildMessage(props: Props, answers: readonly number[], stage: TorrePart) {
  const lines = props.questions.map((question, i) => `${question.short}: ${question.options[answers[i]].label}`);
  return [props.message.opening, "", `${props.message.stage}: ${props.results[stage].verb}`, ...lines, "", props.message.closing].join("\n");
}

/**
 * A Torre como medidor: a silhueta do logo em contorno e, dentro dela, o âmbar que sobe até a etapa do
 * resultado. O enchimento é um retângulo recortado pela silhueta que só se desloca (transform), com a mola padrão.
 */
function TowerMeter({ tower, level }: { tower: Props["tower"]; level: number }) {
  return (
    <svg viewBox={`0 0 ${tower.width} ${tower.height}`} className="quiz__meter" aria-hidden="true" focusable="false">
      <use href={`#${tower.silhouetteId}`} className="quiz__meter-shape" />
      <g clipPath={`url(#${tower.clipId})`}>
        <m.rect
          width={tower.width}
          height={tower.height}
          fill="var(--color-amber)"
          initial={false}
          animate={{ y: tower.height * (1 - level) }}
          transition={SPRING}
        />
      </g>
      <use href={`#${tower.silhouetteId}`} className="quiz__meter-outline" />
    </svg>
  );
}

/**
 * Diagnóstico de 1 minuto. Uma pergunta por vez; cada resposta avança sozinha. No fim, a etapa do método em
 * que a pessoa está e um botão que abre o WhatsApp com as respostas. Nada é enviado nem guardado pelo site.
 *
 * Movimento (Motion): a pergunta entra deslizando no sentido da navegação e a Torre enche até a etapa. Tudo
 * responde a um toque da pessoa; nada se mexe sozinho. Com "menos movimento", só opacidade (MotionConfig).
 */
export function DiagnosticQuiz(props: Props) {
  const { questions, results, levels, ui } = props;
  const [answers, setAnswers] = useState<readonly number[]>([]);
  const [direction, setDirection] = useState(1);
  const heading = useRef<HTMLHeadingElement>(null);
  const touched = useRef(false);

  const step = answers.length;
  const done = step === questions.length;
  const stage = done ? stageOf(questions, answers) : null;

  // depois de cada resposta o foco vai para o título novo: quem usa teclado ou leitor de tela acompanha a troca
  useEffect(() => {
    if (touched.current) heading.current?.focus({ preventScroll: true });
  }, [step]);

  const go = (next: readonly number[], dir: number) => {
    touched.current = true;
    setDirection(dir);
    setAnswers(next);
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <div className="quiz">
          <TowerMeter tower={props.tower} level={stage ? levels[stage] : 0} />

          <div className="quiz__panel">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <m.div
                key={step}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({ opacity: 0, x: dir * SLIDE }),
                  rest: { opacity: 1, x: 0, transition: SPRING },
                  exit: { opacity: 0, transition: EXIT },
                }}
                initial="enter"
                animate="rest"
                exit="exit"
              >
                {stage ? (
                  <>
                    <p className="quiz__meta">{ui.resultLabel}</p>
                    <h3 ref={heading} tabIndex={-1} className="display quiz__result">
                      {results[stage].verb}
                      <span className="quiz__part">{results[stage].partName}</span>
                    </h3>
                    <p className="quiz__text">{results[stage].text}</p>
                    <p className="quiz__text">{results[stage].next}</p>
                    <div className="quiz__actions">
                      <a
                        className="button"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`${props.whatsappBase}${encodeURIComponent(buildMessage(props, answers, stage))}`}
                      >
                        {ui.send}
                      </a>
                      <button type="button" className="quiz__link" onClick={() => go([], -1)}>
                        {ui.restart}
                      </button>
                    </div>
                    <p className="quiz__note">{ui.disclaimer}</p>
                  </>
                ) : (
                  <>
                    <div className="quiz__progress">
                      <p className="quiz__meta">{ui.progress.replace("{n}", String(step + 1)).replace("{total}", String(questions.length))}</p>
                      <div className="quiz__steps" aria-hidden="true">
                        {questions.map((question, i) => (
                          <span key={question.short} data-done={i <= step ? "" : undefined} />
                        ))}
                      </div>
                    </div>
                    <h3 ref={heading} tabIndex={-1} className="display quiz__question">
                      {questions[step].text}
                    </h3>
                    <ul className="quiz__options">
                      {questions[step].options.map((option, i) => (
                        <li key={option.label}>
                          <button type="button" className="quiz__option" onClick={() => go([...answers, i], 1)}>
                            {option.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                    {step > 0 ? (
                      <button type="button" className="quiz__link" onClick={() => go(answers.slice(0, -1), -1)}>
                        {ui.back}
                      </button>
                    ) : null}
                  </>
                )}
              </m.div>
            </AnimatePresence>
          </div>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
