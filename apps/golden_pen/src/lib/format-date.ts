import { dateToJalali, formatJalali } from "@repo/jalali";

/** An ISO date-time as a Persian (Jalali) date in Tehran time, e.g. `۱۴۰۵/۰۸/۰۷`; "—" when there is none or it is invalid. */
export function formatJalaliDate(iso: string | null): string {
  if (iso === null) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return formatJalali(dateToJalali(date, { timeZone: "Asia/Tehran" }));
}
