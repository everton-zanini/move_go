import { format, startOfDay, type FormatOptions } from "date-fns";
import { TZDate, tz } from "@date-fns/tz";

// Fixo em código: a Vercel roda em UTC e não podemos depender de TZ no ambiente.
export const APP_TIME_ZONE = "America/Sao_Paulo";

/** Interpreta "yyyy-MM-dd" + "HH:mm" (digitados no admin) como horário de Brasília. */
export function parseLocalDateTime(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hour, minute] = timeStr.split(":").map(Number);
  return new Date(new TZDate(year, month - 1, day, hour, minute, 0, APP_TIME_ZONE).getTime());
}

/** Interpreta o valor de um input datetime-local ("yyyy-MM-ddTHH:mm") como horário de Brasília. */
export function parseLocalDateTimeInput(value: string): Date {
  const [dateStr, timeStr] = value.split("T");
  return parseLocalDateTime(dateStr, timeStr);
}

/** Formata uma data no fuso de Brasília, independente do fuso do servidor. */
export function formatBR(date: Date, pattern: string, options?: Pick<FormatOptions, "locale">): string {
  return format(date, pattern, { ...options, in: tz(APP_TIME_ZONE) });
}

/** Início do dia atual em Brasília. */
export function startOfTodayBR(): Date {
  return new Date(startOfDay(TZDate.tz(APP_TIME_ZONE)).getTime());
}
