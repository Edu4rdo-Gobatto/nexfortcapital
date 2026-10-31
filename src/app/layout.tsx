import type { Metadata, Viewport } from "next";
import { Cinzel, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { MotionProvider } from "@/components/providers/MotionProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { BRAND } from "@/content/nexfort";
import "lenis/dist/lenis.css";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

// URL de produção (ex.: https://www.seudominio.com.br) para tornar absolutas as imagens de compartilhamento.
// Sem ela, a Vercel usa o domínio do projeto automaticamente.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: `${BRAND.name} | Finanças Empresariais, Pessoais e Investimentos em Sinop - MT`,
  description:
    "Consultoria financeira em Sinop - MT. Organize as finanças da sua empresa e da sua família, multiplique patrimônio na Bolsa e conquiste liberdade financeira com a Nexfort Capital.",
  applicationName: BRAND.shortName,
  keywords: [
    "consultoria financeira Sinop",
    "finanças empresariais",
    "finanças pessoais",
    "investimentos",
    "bolsa de valores",
    "Imersão Torre Mestra",
    "Finance Pro",
    "Nexfort Capital",
  ],
  openGraph: {
    title: `${BRAND.name}: ${BRAND.slogan}`,
    description: BRAND.valueProposition,
    locale: "pt_BR",
    type: "website",
    siteName: BRAND.shortName,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name}: ${BRAND.slogan}`,
    description: BRAND.valueProposition,
  },
};

export const viewport: Viewport = {
  themeColor: "#060913",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${cinzel.variable} ${jakarta.variable} ${jetbrains.variable} antialiased`}>
      <body className="min-h-dvh bg-ink text-led">
        {/* Sem JavaScript, as entradas do Motion nunca rodam: mostra o conteúdo já no estado final. */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <ViewTransitions>
          <MotionProvider>
            <SmoothScrollProvider>{children}</SmoothScrollProvider>
          </MotionProvider>
        </ViewTransitions>
      </body>
    </html>
  );
}
