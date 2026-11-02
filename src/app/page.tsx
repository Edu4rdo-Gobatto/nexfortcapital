import { BrandPrologue } from "@/components/brand/BrandPrologue";
import { Navbar } from "@/components/layout/Navbar";
import { HeadquartersSection, SiteFooter } from "@/components/sections/HeadquartersFooter";
import { HeroSection } from "@/components/sections/HeroSection";
import { PillarsBentoGrid } from "@/components/sections/PillarsBentoGrid";
import { ProgramsAndFounders } from "@/components/sections/ProgramsAndFounders";
import { TowerAndBullStory } from "@/components/sections/TowerAndBullStory";
import { WealthSimulator } from "@/components/sections/WealthSimulator";
import { JsonLd } from "@/components/seo/JsonLd";
import { LedDivider } from "@/components/ui/LedDivider";

// Landing page da Nexfort Capital. Server Component: cada seção traz suas próprias ilhas client.
// Não envolva seções em elementos com transform/filter/will-change (quebraria o pin do ScrollTrigger e o header fixo).
export default function Home() {
  return (
    <>
      <JsonLd />
      <Navbar />
      {/* Abertura decorativa fora do <main>: o "Pular para o conteúdo" da navbar salta direto para a Hero. */}
      <BrandPrologue />
      <main id="conteudo" tabIndex={-1} className="focus:outline-none">
        <HeroSection />
        <TowerAndBullStory />
        <LedDivider />
        <PillarsBentoGrid />
        <LedDivider flip breakAt="30%" />
        <WealthSimulator />
        <LedDivider breakAt="14%" />
        <ProgramsAndFounders />
        <LedDivider flip />
        <HeadquartersSection />
      </main>
      <SiteFooter />
    </>
  );
}
