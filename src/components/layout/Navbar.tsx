"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useLenis } from "lenis/react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavEmblem } from "@/components/layout/NavEmblem";
import { useActiveSection } from "@/components/layout/useActiveSection";
import { CTA_ARROW, CtaLink } from "@/components/ui/CtaLink";
import { BRAND, NAV_LINKS, WHATSAPP_MESSAGES, whatsappLink } from "@/content/nexfort";
import { EASE_OUT_EXPO, SPRING_SMOOTH } from "@/lib/animations";
import { cn } from "@/lib/utils";

const NAV_IDS = NAV_LINKS.map((link) => link.href.slice(1));
const MENU_ID = "menu-mobile";
const CTA_LABEL = "Agendar Diagnóstico";
const CTA_HREF = whatsappLink(WHATSAPP_MESSAGES.diagnostico);
const LG_QUERY = "(min-width: 64rem)";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";

const INDICATOR_TRANSITION = { layout: SPRING_SMOOTH, opacity: { duration: 0.35, ease: EASE_OUT_EXPO } } as const;

/**
 * Cabeçalho fixo: emblema animado, navegação com scrollspy (lg+),
 * CTA de diagnóstico e menu em painel abaixo do lg. A borda inferior é uma fita de LED
 * que acompanha o progresso do scroll.
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const lenis = useLenis();
  const section = useActiveSection(NAV_IDS);
  const headerRef = useRef<HTMLElement>(null);
  const trapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Menu aberto: congela o Lenis e deixa o restante da página inerte (teclado e leitores de tela).
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const restoreOutside = makeOutsideInert(headerRef.current);
    return () => {
      restoreOutside();
      lenis?.start();
    };
  }, [open, lenis]);

  // Ao abrir: foco no primeiro link. Escape fecha e devolve o foco ao botão; Tab circula pelo
  // cabeçalho; atingir o lg fecha o painel.
  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus({ preventScroll: true });

    const desktop = window.matchMedia(LG_QUERY);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
      } else if (event.key === "Tab") {
        trapTab(event, trapRef.current);
      }
    };
    const onBreakpoint = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onBreakpoint);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  /**
   * Fecha o menu ao seguir um link. O Lenis volta a rodar aqui, no handler do React (document),
   * antes do listener de âncoras do próprio Lenis (window): parado, ele ignoraria o scrollTo.
   * O foco não volta ao botão: a navegação por âncora leva o ponto de partida do Tab à seção.
   */
  function closeForNavigation() {
    if (!open) return;
    lenis?.start();
    setOpen(false);
  }

  function handleSectionLink(id: string) {
    section.prefer(id);
    closeForNavigation();
  }

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 h-16 lg:h-20">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-20 focus:bg-gold focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-ink focus:outline-2 focus:outline-offset-4 focus:outline-gold"
      >
        Pular para o conteúdo
      </a>

      <div ref={trapRef}>
        {/* O blur fica numa camada irmã: backdrop-filter no <header> prenderia o painel fixo dentro dele. */}
        <div className="relative z-10 h-16 overflow-x-clip lg:h-20">
          <span aria-hidden="true" className="absolute inset-0 bg-ink/80 backdrop-blur-md" />
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-0 bg-ink opacity-0 transition-opacity duration-300 ease-out-expo",
              open && "opacity-100",
            )}
          />
          <ScrollLed />

          <div className="relative mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
            <a
              href="#inicio"
              aria-label={`${BRAND.shortName}, voltar ao início`}
              onClick={closeForNavigation}
              className={cn("flex shrink-0 items-center gap-3", FOCUS_RING)}
            >
              <NavEmblem className="h-9 w-auto lg:h-11" />
              {/* Entre 1024 e 1151px o menu completo não cabe ao lado do nome: ali, só o emblema.
                  O breakpoint usa rem, como os do tema, para o Tailwind ordenar a cascata corretamente. */}
              <span className="font-display text-[0.95rem] leading-none font-semibold tracking-[0.08em] text-led uppercase lg:hidden min-[72rem]:inline xl:text-[1.05rem]">
                {BRAND.shortName}
              </span>
            </a>

            <DesktopNav current={section.current} last={section.last} onSelect={section.prefer} />

            <div className="flex shrink-0 items-center gap-3">
              <CtaLink
                variant="gold"
                size="md"
                href={CTA_HREF}
                external
                onClick={closeForNavigation}
                className="hidden sm:inline-flex"
              >
                {CTA_LABEL}
                <ArrowUpRight className={cn("size-4", CTA_ARROW)} />
              </CtaLink>
              <MenuToggle ref={toggleRef} open={open} onToggle={() => setOpen((value) => !value)} />
            </div>
          </div>
        </div>

        <div id={MENU_ID} className="lg:hidden">
          <AnimatePresence>
            {open ? (
              <MobileMenu
                key="menu"
                currentId={section.current}
                firstLinkRef={firstLinkRef}
                ctaHref={CTA_HREF}
                ctaLabel={CTA_LABEL}
                onSectionLink={handleSectionLink}
                onLeave={closeForNavigation}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

type DesktopNavProps = {
  current: string | null;
  last: string | null;
  onSelect: (id: string) => void;
};

/**
 * Navegação do lg em diante. O indicador é um trecho aceso da fita de LED inferior: desliza entre
 * os links com layoutId e apaga (opacity) fora das seções do menu. Usa `layoutRoot` porque o
 * cabeçalho é fixo.
 */
function DesktopNav({ current, last, onSelect }: DesktopNavProps) {
  return (
    <nav aria-label="Navegação principal" className="hidden h-full min-w-0 flex-1 justify-center lg:flex">
      <LayoutGroup id="navbar">
        <motion.ul layoutRoot className="flex h-full items-stretch">
          {NAV_LINKS.map((link) => {
            const id = link.href.slice(1);
            const isCurrent = current === id;
            return (
              <li key={link.href} className="relative flex items-center">
                <a
                  href={link.href}
                  aria-current={isCurrent ? "true" : undefined}
                  onClick={() => onSelect(id)}
                  className={cn(
                    "block px-2.5 py-2 text-sm whitespace-nowrap text-muted transition-[color] duration-200 ease-out-expo hover:text-led xl:px-3.5",
                    isCurrent && "text-led",
                    FOCUS_RING,
                  )}
                >
                  {link.label}
                </a>
                {last === id ? (
                  <motion.span
                    aria-hidden="true"
                    layoutId="active-led"
                    className="led-line pointer-events-none absolute inset-x-2.5 bottom-0 h-px xl:inset-x-3.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: current ? 1 : 0 }}
                    transition={INDICATOR_TRANSITION}
                  />
                ) : null}
              </li>
            );
          })}
        </motion.ul>
      </LayoutGroup>
    </nav>
  );
}

/**
 * Fita de LED da borda inferior: um fio-base fixo e uma linha cujo scaleX segue o progresso do scroll
 * (com mola), com uma centelha na ponta. Acende conforme a página sai do topo do hero.
 */
function ScrollLed() {
  const { scrollY, scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, SPRING_SMOOTH);
  const reduceMotion = useReducedMotion();
  // Movimento reduzido: a linha acompanha o scroll 1:1, sem mola (useSpring ignora o MotionConfig).
  // Não altera o markup: no SSR e na hidratação as duas fontes valem 0.
  const progress = reduceMotion ? scrollYProgress : smoothProgress;
  const brightness = useTransform(scrollY, [0, 48, 640], [0, 0.6, 1]);
  const tipX = useTransform(progress, (value) => `${value * 100}%`);

  return (
    <>
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/8" />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left bg-linear-to-r from-royal-glow/0 via-led/45 to-led shadow-[0_0_6px_rgb(248_250_252/0.5),0_0_18px_rgb(248_250_252/0.2)]"
        style={{ scaleX: progress, opacity: brightness }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{ x: tipX, opacity: brightness }}
      >
        <span className="absolute right-full -bottom-px h-0.75 w-12 bg-linear-to-r from-transparent to-led blur-[1.5px]" />
      </motion.span>
    </>
  );
}

type MenuToggleProps = {
  ref: Ref<HTMLButtonElement>;
  open: boolean;
  onToggle: () => void;
};

/**
 * Botão do menu (abaixo do lg): duas linhas de LED que giram até formar um X (só transform).
 * Moldura e linhas são só fundo, que as cores forçadas (temas de contraste) apagam: ali o botão
 * ganha borda ButtonText e as linhas, fundo CanvasText.
 */
function MenuToggle({ ref, open, onToggle }: MenuToggleProps) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={MENU_ID}
      aria-label={open ? "Fechar menu" : "Abrir menu"}
      className={cn(
        "relative isolate grid size-11 place-items-center text-led lg:hidden forced-colors:border forced-colors:border-[ButtonText]",
        FOCUS_RING,
      )}
    >
      <span aria-hidden="true" className="clip-chamfer absolute inset-0 -z-10 bg-white/15 [--cut:10px]" />
      <span aria-hidden="true" className="clip-chamfer absolute inset-px -z-10 bg-ink [--cut:10px]" />
      <motion.span
        aria-hidden="true"
        className="absolute h-[1.5px] w-5 bg-current forced-colors:bg-[CanvasText]"
        initial={false}
        animate={open ? { y: 0, rotate: 45 } : { y: -3.5, rotate: 0 }}
        transition={SPRING_SMOOTH}
      />
      <motion.span
        aria-hidden="true"
        className="absolute h-[1.5px] w-5 bg-current forced-colors:bg-[CanvasText]"
        initial={false}
        animate={open ? { y: 0, rotate: -45 } : { y: 3.5, rotate: 0 }}
        transition={SPRING_SMOOTH}
      />
    </button>
  );
}

/**
 * Torna inerte tudo fora do cabeçalho: os irmãos dele e os de cada ancestral até o <body>
 * (funciona mesmo que o Navbar seja envolvido por outro elemento). Devolve a função que desfaz
 * só o que foi alterado aqui.
 */
function makeOutsideInert(element: HTMLElement | null) {
  const changed: HTMLElement[] = [];
  let node = element;
  while (node && node !== document.body && node.parentElement) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling === node || !(sibling instanceof HTMLElement) || sibling.inert) continue;
      sibling.inert = true;
      changed.push(sibling);
    }
    node = node.parentElement;
  }
  return () => {
    for (const sibling of changed) sibling.inert = false;
  };
}

/** Mantém o Tab dentro do cabeçalho (barra + painel) enquanto o menu está aberto. */
function trapTab(event: KeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const focusable = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => element.getClientRects().length > 0,
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  const outside = !root.contains(active);
  if (event.shiftKey && (active === first || outside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || outside)) {
    event.preventDefault();
    first.focus();
  }
}
