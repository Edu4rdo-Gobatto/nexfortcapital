import os from "node:os";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Endereços IPv4 desta máquina (Wi-Fi, cabo, VPN): são os que um celular na mesma rede usa para abrir o
 * `next dev`. O Next só libera `localhost` por padrão; por qualquer outro endereço ele bloqueia os recursos de
 * desenvolvimento, a página não liga o JavaScript e a Torre 3D, o diagnóstico e o cabeçalho não funcionam.
 * Liberar os endereços da própria máquina resolve isso sem configuração manual, mesmo quando o IP muda.
 * NEXT_DEV_ORIGINS (separado por vírgula) acrescenta outros, como o endereço de um túnel.
 */
const localAddresses = Object.values(os.networkInterfaces())
  .flatMap((addresses) => addresses ?? [])
  .filter((address) => address.family === "IPv4" && !address.internal)
  .map((address) => address.address);

const extraOrigins = (process.env.NEXT_DEV_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  // Pasta de saída: .next por padrão. NEXT_DIST_DIR permite buildar e servir ao lado de um `next start` antigo
  // ainda de pé, sem trocar o .next por baixo dele (ver design/qa/README.md).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: [...localAddresses, ...extraOrigins],
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
