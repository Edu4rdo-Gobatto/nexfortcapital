"use client";

import { useSyncExternalStore } from "react";
import { CONTACT } from "@/content/nexfort";
import { MonoNumbers } from "./MonoNumbers";

const STATUS = CONTACT.openingStatus;
/** Hora de abertura nos dias úteis (as 08:00 dos textos de CONTACT.openingStatus). */
const OPENING_HOUR = 8;
const REFRESH_MS = 60_000;

/** Dia da semana e hora na sede. en-US fixa os nomes (Sat, Sun); h23 conta de 0 a 23 (nunca "24" à meia-noite). */
const SITE_CLOCK = new Intl.DateTimeFormat("en-US", {
  timeZone: STATUS.timeZone,
  weekday: "short",
  hour: "numeric",
  hourCycle: "h23",
});

function subscribe(onTick: () => void) {
  const timer = window.setInterval(onTick, REFRESH_MS);
  return () => window.clearInterval(timer);
}

/**
 * Status no relógio da sede agora. Devolve a própria string (primitivo): o React só re-renderiza quando o
 * texto muda. Qualquer leitura inesperada cai no expediente, que vale a qualquer hora.
 */
function getSnapshot(): string {
  const parts = SITE_CLOCK.formatToParts(new Date());
  const weekday = parts.find((part) => part.type === "weekday")?.value;
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  if (weekday === "Sat" || weekday === "Sun") return STATUS.weekend;
  if (hour < OPENING_HOUR) return STATUS.beforeOpening;
  return STATUS.schedule;
}

/** Prerender e hidratação exibem o expediente: nenhum Date no servidor, nenhum mismatch. */
const getServerSnapshot = (): string => STATUS.schedule;

/**
 * Status de atendimento no fuso da sede (America/Cuiaba): fim de semana, dia útil antes das 08:00 ou o
 * expediente. Sem o horário de fechamento, nunca afirma "aberto agora". Logo após a hidratação, o cliente
 * troca o expediente pelo status do momento e o revisa a cada minuto.
 */
export function OpeningStatus() {
  const status = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <MonoNumbers text={status} />;
}
