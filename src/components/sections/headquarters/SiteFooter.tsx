import { ArrowUp } from "lucide-react";
import { NexfortLogo } from "@/components/brand/NexfortLogo";
import { InstagramIcon } from "@/components/ui/BrandIcons";
import { BRAND, CONTACT, NAV_LINKS, SECTION_IDS } from "@/content/nexfort";
import { cn } from "@/lib/utils";

const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold";
const NAV_LABEL_ID = "rodape-secoes";

/** Rodapé do site: assinatura, atalhos para as seções, Instagram, aviso legal e volta ao topo. */
export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-ink">
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-5">
            <NexfortLogo showTagline emblemClassName="h-12" />
            <p className="mt-6 max-w-[46ch] text-sm leading-relaxed text-muted">{BRAND.mission}</p>
          </div>

          <nav aria-labelledby={NAV_LABEL_ID} className="lg:col-span-4">
            <p id={NAV_LABEL_ID} className="text-sm font-medium text-led">
              Seções
            </p>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={cn(
                      "text-sm text-muted transition-[color] duration-200 ease-out-expo hover:text-led",
                      FOCUS_RING,
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="text-sm font-medium text-led">Siga a Nexfort</p>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "mt-5 inline-flex items-center gap-2.5 text-sm text-muted transition-[color] duration-200 ease-out-expo hover:text-led",
                FOCUS_RING,
              )}
            >
              <InstagramIcon className="size-5 shrink-0" />
              {CONTACT.instagramHandle}
              <span className="sr-only">{" no Instagram (abre em nova aba)"}</span>
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-8 border-t border-white/8 pt-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5 text-xs leading-relaxed text-muted">
            <p>© {BRAND.name}. Todos os direitos reservados.</p>
            <p>Conteúdo informativo. Não constitui recomendação de investimento.</p>
          </div>
          <a
            href={`#${SECTION_IDS.hero}`}
            className={cn(
              "inline-flex shrink-0 items-center gap-3 self-start text-sm text-muted transition-[color] duration-200 ease-out-expo hover:text-led sm:self-auto",
              FOCUS_RING,
            )}
          >
            <span aria-hidden="true" className="grid size-9 place-items-center border border-white/12 bg-concrete">
              <ArrowUp className="size-4" />
            </span>
            Voltar ao topo
          </a>
        </div>
      </div>
    </footer>
  );
}
