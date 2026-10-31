import { useCallback, useEffect, useRef, useState } from "react";

type SectionState = {
  /** Alvo que cruza a linha de leitura agora; null fora das seções do menu. */
  current: string | null;
  /** Último alvo ativo: o indicador fica parado nele enquanto apaga. */
  last: string | null;
};

const NONE: SectionState = { current: null, last: null };

/** Linha de leitura: faixa de 1% a 45% do topo da viewport. */
const READING_LINE = "-45% 0px -54% 0px";

/**
 * Scrollspy com IntersectionObserver: diz qual dos ids cruza a linha de leitura.
 * `ids` precisa ser estável (constante de módulo); ids ausentes no DOM são ignorados.
 * `prefer(id)` desempata alvos lado a lado (cards em grade cruzam a linha juntos)
 * a favor do último link clicado; sem preferência, vence o alvo mais específico (o de menor altura,
 * ver `mostSpecific`) e, empatados, a ordem do menu.
 */
export function useActiveSection(ids: readonly string[]) {
  const [section, setSection] = useState<SectionState>(NONE);
  const crossingRef = useRef<Map<string, Element> | null>(null);
  const preferredRef = useRef<string | null>(null);

  // Chamado só pelo observer e pelo prefer() (handler de clique): nunca durante o render.
  const resolve = useCallback(() => {
    const crossing = crossingRef.current;
    if (!crossing) return;
    const preferred = preferredRef.current;
    const next = preferred !== null && crossing.has(preferred) ? preferred : mostSpecific(ids, crossing);
    setSection((prev) => (prev.current === next ? prev : { current: next, last: next ?? prev.last }));
  }, [ids]);

  useEffect(() => {
    const targets = ids
      .map((id) => document.getElementById(id))
      .filter((target): target is HTMLElement => target !== null);
    if (targets.length === 0) return;

    const crossing = new Map<string, Element>();
    crossingRef.current = crossing;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.set(entry.target.id, entry.target);
          else crossing.delete(entry.target.id);
        }
        resolve();
      },
      { rootMargin: READING_LINE },
    );
    for (const target of targets) observer.observe(target);

    return () => {
      observer.disconnect();
      crossingRef.current = null;
    };
  }, [ids, resolve]);

  const prefer = useCallback(
    (id: string) => {
      preferredRef.current = id;
      resolve();
    },
    [resolve],
  );

  return { current: section.current, last: section.last, prefer };
}

/**
 * Entre os alvos que cruzam a linha, vence o de menor altura: um card contido na faixa vertical de
 * outro (do md em diante, Finanças Pessoais fica ao lado da laje alta de Finanças Empresariais, que
 * ocupa duas linhas) também pode ficar ativo. Altura lida na hora (layout responsivo); empate, ordem do menu.
 */
function mostSpecific(ids: readonly string[], crossing: ReadonlyMap<string, Element>) {
  let best: string | null = null;
  let bestHeight = Infinity;
  for (const id of ids) {
    const target = crossing.get(id);
    if (!target) continue;
    const height = target.getBoundingClientRect().height;
    if (height < bestHeight) {
      best = id;
      bestHeight = height;
    }
  }
  return best;
}
