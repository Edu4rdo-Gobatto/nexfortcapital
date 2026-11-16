import { Fragment } from "react";
import { BrandSymbols } from "@/components/brand/Brand";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Footer, Header } from "@/components/sections/Chrome";
import { Diagnostic } from "@/components/sections/Diagnostic";
import { Faq } from "@/components/sections/Faq";
import { Hero } from "@/components/sections/Hero";
import { Signature } from "@/components/sections/Signature";
import { SplitBlock } from "@/components/sections/SplitBlock";
import { TorreStage } from "@/components/torre/TorreStage";
import { blocks, DIAGNOSTIC_AFTER, FAQ_AFTER } from "@/content/nexfort";

/**
 * "Uma volta na Torre": hero, seis blocos imagem/texto (as três frentes, o método, os programas e os sócios),
 * o diagnóstico, as dúvidas e a assinatura com o contato.
 * A Torre 3D vive num palco fixo atrás do conteúdo e visita a âncora de cada seção, sempre com o desenho
 * (frente ou verso) virado para o texto, sem nada colorido atrás dela. No bloco do método ela se desmonta em
 * base, corpo e coroa (as três etapas) e, logo depois, o diagnóstico diz ao visitante em qual delas ele está.
 */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <BrandSymbols />
      <TorreStage>
        <Header />
        <main id="conteudo" tabIndex={-1} className="overflow-x-clip outline-none">
          <Hero />
          {blocks.map((block) => (
            <Fragment key={block.id}>
              <SplitBlock block={block} />
              {block.id === DIAGNOSTIC_AFTER ? <Diagnostic /> : null}
              {block.id === FAQ_AFTER ? <Faq /> : null}
            </Fragment>
          ))}
          <Signature />
        </main>
        <Footer />
      </TorreStage>
    </>
  );
}
