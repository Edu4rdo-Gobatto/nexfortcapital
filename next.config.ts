import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pasta de saída: .next por padrão. NEXT_DIST_DIR permite buildar e servir ao lado de um `next start` antigo
  // ainda de pé, sem trocar o .next por baixo dele (ver design/qa/README.md).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Endereços além de localhost que podem abrir o `next dev` (IP da rede, para testar no celular; túnel). Sem
  // isto o Next bloqueia os recursos de desenvolvimento para esse endereço, a página não hidrata e a Torre 3D
  // não aparece. A lista fica em NEXT_DEV_ORIGINS, no .env.local (fora do Git), separada por vírgula.
  allowedDevOrigins: (process.env.NEXT_DEV_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  cacheComponents: true,
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
