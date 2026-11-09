import { Wordmark } from "@/components/brand/Brand";
import { company, footer, hero, whatsappLink } from "@/content/nexfort";
import { ExternalLink } from "./ExternalLink";

/** Cabeçalho mínimo: o nome e um caminho para conversar. Rola com a página. */
export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20 px-(--gutter)">
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-20 w-full max-w-(--page-max) items-center justify-between">
        <a href="#topo" className="focus-ring -m-2 p-2" aria-label={`${company.name}, início`}>
          <Wordmark className="h-3.5 w-auto text-ink" />
        </a>
        {/* a mesma ação do botão do hero, com as mesmas palavras */}
        <ExternalLink className="text-link text-sm" href={whatsappLink(hero.cta.message)}>
          {hero.cta.label}
        </ExternalLink>
      </div>
    </header>
  );
}

/** Ano do copyright, guardado no esqueleto estático (Cache Components pede "use cache" para ler a data). */
async function CopyrightYear() {
  "use cache";
  return <>{new Date().getFullYear()}</>;
}

/** Rodapé marinho: fecha a página no 30% da paleta. A Torre nunca fica sobre ele (já subiu com a assinatura). */
export function Footer() {
  return (
    <footer className="on-navy bg-navy px-(--gutter) py-10 text-paper">
      <div className="mx-auto flex w-full max-w-(--page-max) flex-col gap-3 text-sm text-paper/75 sm:flex-row sm:justify-between">
        <p>
          © <CopyrightYear /> {company.legalName}
        </p>
        <p>{footer.note}</p>
      </div>
    </footer>
  );
}
