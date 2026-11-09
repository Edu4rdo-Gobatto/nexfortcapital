import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, Newsreader } from "next/font/google";
import "./globals.css";

const display = Newsreader({ subsets: ["latin"], axes: ["opsz"], variable: "--font-newsreader", display: "swap" });
const sans = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const metadata: Metadata = {
  title: "Nexfort Capital · Consultoria financeira em Sinop, MT",
  description: "Consultoria em finanças empresariais, finanças pessoais e investimentos. Sinop, MT.",
  // Prévia de demonstração: fora dos buscadores até a venda (MEMORIA_DO_PROJETO.md, seção 9).
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f9", // --color-paper
};

/**
 * Antes da primeira pintura: marca que há JavaScript (o texto dos blocos pode nascer escondido para a
 * revelação). Se o app não confirmar em 4 s (rede lenta, erro), a marca sai e todo o texto aparece.
 */
const BOOT = `(function(){var d=document.documentElement;d.setAttribute("data-js","");setTimeout(function(){if(!d.hasAttribute("data-reveal-ready"))d.removeAttribute("data-js")},4000)})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <noscript>
          <style>{".torre-fallback{display:block}"}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
