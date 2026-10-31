import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => null;

/**
 * `prefers-reduced-motion` ao vivo: null no servidor e na hidratação, boolean depois,
 * e atualiza se o usuário mudar a preferência com a página aberta (o useReducedMotion do Motion não atualiza).
 * Como o useReducedMotion, use para decidir laços, física e handlers; nunca para mudar o markup.
 */
export function usePrefersReducedMotion(): boolean | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
