/** Grupos de dígitos (253, 78555-474, 08:00) para compor em JetBrains Mono dentro do texto corrido. */
const NUMBER_RUN = /(\d+(?:[.,:-]\d+)*)/;

/** Texto corrido com os números em mono tabular. Sem diretiva: serve à placa (servidor) e ao OpeningStatus (cliente). */
export function MonoNumbers({ text }: { text: string }) {
  return text
    .split(NUMBER_RUN)
    .map((part, index) =>
      index % 2 === 1 ? (
        <span key={`${index}-${part}`} className="font-mono text-[0.94em] tabular-nums">
          {part}
        </span>
      ) : (
        part
      ),
    );
}
