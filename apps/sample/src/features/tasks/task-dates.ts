import { formatJalali, gregorianToJalali, jalaliToGregorian, type JalaliDate } from "@repo/jalali";

/**
 * The API stores Gregorian `YYYY-MM-DD` dates; the UI shows and picks them in Jalali.
 * Timestamps are shown by their UTC calendar day (the app's next-intl time zone).
 */
export function isoToJalali(iso: string): JalaliDate {
  const [year = Number.NaN, month = Number.NaN, day = Number.NaN] = iso
    .slice(0, 10)
    .split("-")
    .map(Number);
  return gregorianToJalali({ year, month, day });
}

export function jalaliToIso(date: JalaliDate): string {
  const { year, month, day } = jalaliToGregorian(date);
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** `"2026-03-21"` or an ISO timestamp → `"۱ فروردین ۱۴۰۵"` / `"1 Farvardin 1405"`. */
export function formatTaskDate(iso: string, locale: "fa" | "en"): string {
  return formatJalali(isoToJalali(iso), "D MMMM YYYY", { locale });
}
