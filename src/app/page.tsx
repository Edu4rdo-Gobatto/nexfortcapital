import { EmblemSymbol } from "@/components/brand/Brand";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Footer, Header } from "@/components/sections/Chrome";
import { Hero } from "@/components/sections/Hero";
import { Signature } from "@/components/sections/Signature";
import { SplitBlock } from "@/components/sections/SplitBlock";
import { TorreStage } from "@/components/torre/TorreStage";
import { blocks } from "@/content/nexfort";

/**
 * "Uma volta na Torre" — fatia de prova (Fase 2): hero, um bloco imagem/texto e a assinatura.
 * A Torre 3D vive num palco fixo atrás do conteúdo e visita a âncora de cada seção.
 */
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <EmblemSymbol />
      <TorreStage>
        <Header />
        <main>
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
