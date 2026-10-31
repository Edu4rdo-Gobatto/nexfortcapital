import type { ChangeEvent, CSSProperties } from "react";

// Sem "use client": componente de apresentação, renderizado apenas pelo SimulatorConsole (cliente).

/**
 * Trilho com preenchimento ouro → âmbar até --fill (definido inline a partir do estado: é estilo,
 * não animação). O polegar é um "fader" de mesa de som: retângulo LED com um friso central escuro.
 * WebKit e Firefox têm pseudo-elementos próprios; cada um vira uma regra separada no CSS gerado.
 * As classes ficam escritas por extenso: o Tailwind só gera o que encontra literalmente no código.
 */
const RANGE_CLASSES = [
  "block h-11 w-full cursor-pointer appearance-none bg-transparent active:cursor-grabbing",
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
  // WebKit / Blink
  "[&::-webkit-slider-runnable-track]:h-1.5",
  "[&::-webkit-slider-runnable-track]:bg-[linear-gradient(90deg,var(--color-gold),var(--color-ember)_var(--fill),rgb(248_250_252/0.12)_var(--fill))]",
  "[&::-webkit-slider-thumb]:-mt-[9px] [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-3.5",
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:border-0",
  "[&::-webkit-slider-thumb]:bg-[linear-gradient(90deg,var(--color-led)_0_42%,var(--color-ink)_42%_58%,var(--color-led)_58%)]",
  "[&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgb(245_158_11/0.9),0_0_14px_rgb(245_158_11/0.5)]",
  // Firefox
  "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:border-0",
  "[&::-moz-range-track]:bg-[linear-gradient(90deg,var(--color-gold),var(--color-ember)_var(--fill),rgb(248_250_252/0.12)_var(--fill))]",
  "[&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0",
  "[&::-moz-range-thumb]:bg-[linear-gradient(90deg,var(--color-led)_0_42%,var(--color-ink)_42%_58%,var(--color-led)_58%)]",
  "[&::-moz-range-thumb]:shadow-[0_0_0_1px_rgb(245_158_11/0.9),0_0_14px_rgb(245_158_11/0.5)]",
  // Cores forçadas (alto contraste do Windows): o modo descarta background-image e box-shadow, e trilho e
  // polegar sumiriam. Cores de sistema são preservadas pelo navegador.
  "forced-colors:[&::-webkit-slider-runnable-track]:bg-[CanvasText] forced-colors:[&::-moz-range-track]:bg-[CanvasText]",
  "forced-colors:[&::-webkit-slider-thumb]:border-2 forced-colors:[&::-webkit-slider-thumb]:border-[ButtonText]",
  "forced-colors:[&::-webkit-slider-thumb]:bg-[Highlight]",
  "forced-colors:[&::-moz-range-thumb]:border-2 forced-colors:[&::-moz-range-thumb]:border-[ButtonText]",
  "forced-colors:[&::-moz-range-thumb]:bg-[Highlight]",
].join(" ");

type RangeFieldProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Valor formatado exibido ao lado do rótulo (ex.: "R$ 50.000"). */
  display: string;
  /** Leitura para tecnologias assistivas (ex.: "R$ 2.000 por mês"). */
  valueText: string;
  minLabel: string;
  maxLabel: string;
  onValueChange: (value: number) => void;
};

export function RangeField({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  valueText,
  minLabel,
  maxLabel,
  onValueChange,
}: RangeFieldProps) {
  const fill = max > min ? ((value - min) / (max - min)) * 100 : 0;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onValueChange(event.currentTarget.valueAsNumber);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm font-medium text-led sm:text-base">
          {label}
        </label>
        {/* O valor já é anunciado pelo próprio controle (aria-valuetext). */}
        <span aria-hidden="true" className="font-mono text-base text-led tabular-nums sm:text-lg">
          {display}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        aria-valuetext={valueText}
        className={RANGE_CLASSES}
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
      {/* Régua de 10 divisões alinhada ao centro do polegar (que anda 7px para dentro de cada ponta). */}
      <div aria-hidden="true">
        <span className="mx-1.75 block h-1.5 border-r border-white/20 bg-[linear-gradient(90deg,rgb(248_250_252/0.2)_1px,transparent_1px)] bg-size-[10%_100%]" />
        <span className="mt-1.5 flex justify-between font-mono text-[11px] text-muted tabular-nums">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </span>
      </div>
    </div>
  );
}
