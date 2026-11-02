import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // Quadros da abertura e a logo: o padrão do /public é max-age=0 (revalida ~57 arquivos a cada visita).
  // Um dia de cache, com revalidação em segundo plano; trocar os arquivos aparece no máximo no dia seguinte.
  async headers() {
    const cache = [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }];
    return [
      { source: "/motion/:path*", headers: cache },
      { source: "/brand/:path*", headers: cache },
    ];
  },
  partialPrefetching: true,
  turbopack: {
    // Fixa a raiz no próprio projeto: a pasta-mãe ("Meu site") tem outros projetos e um package-lock.json solto.
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
