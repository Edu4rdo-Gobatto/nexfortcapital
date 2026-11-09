import { BrandSymbols } from "@/components/brand/Brand";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Footer, Header } from "@/components/sections/Chrome";
import { Hero } from "@/components/sections/Hero";
import { Signature } from "@/components/sections/Signature";
import { SplitBlock } from "@/components/sections/SplitBlock";
import { TorreStage } from "@/components/torre/TorreStage";
import { blocks } from "@/content/nexfort";

/**
 * "Uma volta na Torre": hero, seis blocos imagem/texto (o sexto, dos sócios, sem a Torre) e a assinatura.
 * A Torre 3D vive num palco fixo atrás do conteúdo e visita a âncora de cada seção, sempre com o desenho
 * (frente ou verso) virado para o texto.
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
            <SplitBlock key={block.id} block={block} />
          ))}
          <Signature />
        </main>
        <Footer />
      </TorreStage>
    </>
  );
}
