import { Wordmark } from "@/components/brand/Brand";
import { company, footer, hero, whatsappLink } from "@/content/nexfort";

/** Cabeçalho mínimo: o nome e um caminho para conversar. Rola com a página. */
export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 px-(--gutter)">
      <div className="mx-auto flex h-20 w-full max-w-(--page-max) items-center justify-between">
        <a href="#topo" className="focus-ring -m-2 p-2" aria-label={`${company.name}, início`}>
          <Wordmark className="h-3.5 w-auto text-ink" />
        </a>
        <a className="text-link text-sm" href={whatsappLink(hero.cta.message)} target="_blank" rel="noopener noreferrer">
          Fale conosco
        </a>
      </div>
    </header>
  );
}

/** Ano do copyright, guardado no esqueleto estático (Cache Components pede "use cache" para ler a data). */
async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

export function Footer() {
  return (
    <footer className="px-(--gutter) pb-10">
      <div className="mx-auto flex w-full max-w-(--page-max) flex-col gap-2 border-t border-line pt-8 text-sm text-ink-soft sm:flex-row sm:justify-between">
        <p>
          © <CopyrightYear /> {company.legalName}
        </p>
        <p>{footer.note}</p>
      </div>
    </footer>
  );
}
