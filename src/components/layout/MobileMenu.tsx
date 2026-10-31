"use client";

import type { CSSProperties, RefObject } from "react";
import { ArrowUpRight, Phone } from "lucide-react";
import { motion, stagger, useIsPresent, type Variants } from "motion/react";
import { CtaLink } from "@/components/ui/CtaLink";
import { CONTACT, NAV_LINKS } from "@/content/nexfort";
import { EASE_OUT_EXPO, SPRING_SMOOTH } from "@/lib/animations";
import { cn } from "@/lib/utils";

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

/** Painel: entra descendo de baixo do cabeçalho; os filhos (LED, links, contato) em sequência. */
const panel = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...SPRING_SMOOTH,
      opacity: { duration: 0.3, ease: EASE_OUT_EXPO },
      delayChildren: stagger(0.045, { startDelay: 0.05 }),
    },
  },
  exit: { opacity: 0, y: -8, transition: { duration: 0.22, ease: EASE_OUT_EXPO } },
} satisfies Variants;

// Sem `delay` nos filhos: um delay aqui substituiria o atraso calculado pelo stagger do painel.
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { ...SPRING_SMOOTH, opacity: { duration: 0.4, ease: EASE_OUT_EXPO } } },
} satisfies Variants;

const glass = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: EASE_OUT_EXPO } },
} satisfies Variants;

const ledDraw = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.2, ease: EASE_OUT_EXPO } },
} satisfies Variants;

/** Fachada da sede: a fita de LED corta o painel a 32° (--facade-angle); abaixo dela, o vidro duplo. */
const FACADE_TOP = "64%";
const GLASS_STYLE: CSSProperties = {
  clipPath: `polygon(0 ${FACADE_TOP}, 100% calc(${FACADE_TOP} + 100vw * tan(var(--facade-angle))), 100% 100%, 0 100%)`,
};
const LED_STYLE: CSSProperties = { top: FACADE_TOP, rotate: "var(--facade-angle)" };

type MobileMenuProps = {
  /** Seção sob a linha de leitura (scrollspy), marcada como andar aceso. */
  currentId: string | null;
  /** Recebe o foco quando o painel abre. */
  firstLinkRef: RefObject<HTMLAnchorElement | null>;
  ctaHref: string;
  ctaLabel: string;
  onSectionLink: (id: string) => void;
  /** Links que saem da página (WhatsApp, telefone): só fecham o menu. */
  onLeave: () => void;
};

/** Painel do menu abaixo do lg. Montado/desmontado pelo AnimatePresence do Navbar. */
export function MobileMenu({ currentId, firstLinkRef, ctaHref, ctaLabel, onSectionLink, onLeave }: MobileMenuProps) {
  // Durante a saída o painel ainda está no DOM: inerte, ele não recebe foco nem cliques.
  const isPresent = useIsPresent();

  return (
    <motion.div
      variants={panel}
      initial="hidden"
      animate="visible"
      exit="exit"
      inert={!isPresent}
      className="concrete-noise fixed inset-x-0 top-16 bottom-0 overflow-hidden bg-concrete"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div variants={glass} className="absolute inset-0 bg-navy/60" style={GLASS_STYLE} />
        <div className="absolute left-0 h-px w-[130vw] origin-left" style={LED_STYLE}>
          <motion.span
            variants={ledDraw}
            className="absolute inset-0 origin-left bg-linear-to-r from-led/0 via-led/90 via-15% to-led shadow-[0_0_10px_rgb(248_250_252/0.5),0_0_2px_rgb(248_250_252/0.9)]"
          />
        </div>
      </div>

      <nav
        aria-label="Navegação principal"
        data-lenis-prevent
        className="relative h-full overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-10 px-5 pt-3 pb-8 sm:px-8">
          <ul className="border-b border-white/8">
            {NAV_LINKS.map((link, index) => {
              const id = link.href.slice(1);
              const isCurrent = currentId === id;
              return (
                <motion.li key={link.href} variants={item} className="border-t border-white/8 first:border-t-0">
                  <a
                    ref={index === 0 ? firstLinkRef : undefined}
                    href={link.href}
                    aria-current={isCurrent ? "true" : undefined}
                    onClick={() => onSectionLink(id)}
                    className={cn(
                      "flex items-center justify-between gap-4 py-4 font-display text-[clamp(1.375rem,6.2vw,2.75rem)] leading-[1.1] tracking-[0.02em] text-led hover:text-gold",
                      FOCUS_RING,
                    )}
                  >
                    {link.label}
                    {/* "Andar" da torre: o da seção atual fica aceso (em cores forçadas, com CanvasText). */}
                    <span aria-hidden="true" className="relative size-2 shrink-0 border border-white/25">
                      <span
                        className={cn(
                          "absolute -inset-px bg-led opacity-0 shadow-[0_0_10px_rgb(248_250_252/0.7)] transition-opacity duration-500 ease-out-expo forced-colors:bg-[CanvasText]",
                          isCurrent && "opacity-100",
                        )}
                      />
                    </span>
                  </a>
                </motion.li>
              );
            })}
          </ul>

          {/* No sm+ o CTA de diagnóstico já está na barra: aqui fica só o telefone. A placa de vidro
              do botão secundário também mantém o número legível sobre a fita de LED. */}
          <motion.div variants={item} className="mt-auto flex flex-col gap-3 sm:items-start">
            <CtaLink variant="gold" size="lg" href={ctaHref} external onClick={onLeave} className="w-full sm:hidden">
              {ctaLabel}
              <ArrowUpRight className="size-4" />
            </CtaLink>
            <CtaLink variant="glass" size="lg" href={CONTACT.phoneHref} onClick={onLeave} className="w-full sm:w-auto">
              <Phone className="size-4 text-gold" />
              <span>
                Ligar para <span className="font-mono tabular-nums">{CONTACT.phoneDisplay}</span>
              </span>
            </CtaLink>
          </motion.div>
        </div>
      </nav>
    </motion.div>
  );
}
