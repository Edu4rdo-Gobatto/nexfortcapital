import { Wordmark } from "@/components/brand/Brand";
import { areas, company, footer, hero, nav, whatsappLink } from "@/content/nexfort";
import { ExternalLink } from "./ExternalLink";
import { HeaderShell } from "./HeaderShell";

/**
 * Cabeçalho fixo: o nome, as seções (só em tela larga) e um caminho para conversar, sempre à mão. No topo da
 * página é transparente; depois de rolar ganha fundo e um filete de progresso (HeaderShell).
 */
export function Header() {
  return (
    <HeaderShell>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-18 w-full max-w-(--page-max) items-center justify-between">
        <a href="#topo" className="focus-ring -m-2 p-2" aria-label={`${company.name}, início`}>
          <Wordmark className="h-3 w-auto text-ink sm:h-3.5" />
        </a>
        <nav aria-label="Seções" className="hidden lg:block">
          <ul className="flex gap-x-7 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <a className="nav-link" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {/* a mesma ação do botão do hero, com as mesmas palavras */}
        <ExternalLink className="button button--small" href={whatsappLink(hero.cta.message)}>
          {hero.cta.label}
        </ExternalLink>
      </div>
    </HeaderShell>
  );
}

/** Ano do copyright, guardado no esqueleto estático (Cache Components pede "use cache" para ler a data). */
async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

/** Rodapé marinho, com o que um rodapé de verdade tem: quem é, as frentes, as seções, o contato e os avisos. */
export function Footer() {
  return (
    <footer className="layer on-navy bg-navy px-(--gutter) pt-16 pb-10 text-paper">
      <div className="mx-auto grid w-full max-w-(--page-max) grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-12">
        <div className="col-span-2 lg:col-span-4">
          <Wordmark className="h-4 w-auto" title={company.name} />
          <p className="mt-5 max-w-[34ch] text-paper/75">{footer.about}</p>
        </div>

        <nav aria-label={footer.columns.services} className="lg:col-span-3 lg:col-start-6">
          <p className="footer-title">{footer.columns.services}</p>
          <ul className="mt-4 grid gap-3">
            {Object.values(areas).map((area) => (
              <li key={area.href}>
                <a className="footer-link" href={area.href}>
                  {area.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={footer.columns.company} className="lg:col-span-2">
          <p className="footer-title">{footer.columns.company}</p>
          <ul className="mt-4 grid gap-3">
            {nav.slice(1).map((item) => (
              <li key={item.href}>
                <a className="footer-link" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 lg:col-span-2">
          <p className="footer-title">{footer.columns.contact}</p>
          <ul className="mt-4 grid gap-3">
            <li>
              <ExternalLink className="footer-link" href={whatsappLink(hero.cta.message)}>
                {company.whatsappDisplay}
              </ExternalLink>
            </li>
            <li>
              <ExternalLink className="footer-link" href={company.instagram.url}>
                {company.instagram.handle}
              </ExternalLink>
            </li>
            <li className="text-paper/75">
              {company.address.street}
              <br />
              {company.address.city}
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-14 flex w-full max-w-(--page-max) flex-col gap-3 border-t border-paper/15 pt-6 text-sm text-paper/65 lg:flex-row lg:justify-between">
        <p>
          © <CopyrightYear /> {company.legalName}
        </p>
        <p>{footer.risk}</p>
        <p>{footer.note}</p>
      </div>
    </footer>
  );
}
