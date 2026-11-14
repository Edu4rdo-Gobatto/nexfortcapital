"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * Casca do cabeçalho fixo. Duas coisas dependem da rolagem, e só elas vivem no cliente:
 *  - o fundo: transparente no topo da página, sólido (com um fio embaixo) depois de rolar um pouco;
 *  - a barra de progresso: um filete âmbar que cresce com a rolagem (só scaleX, no compositor).
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const header = root.current;
      if (!header || !bar.current) return;
      const setProgress = gsap.quickSetter(bar.current, "scaleX");
      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          setProgress(self.progress);
          header.toggleAttribute("data-scrolled", self.scroll() > 24);
        },
        onRefresh: (self) => {
          setProgress(self.progress);
          header.toggleAttribute("data-scrolled", self.scroll() > 24);
        },
      });
    },
    { scope: root },
  );

  return (
    <header ref={root} className="site-header">
      {children}
      <span ref={bar} className="site-header__progress" aria-hidden="true" />
    </header>
  );
}
