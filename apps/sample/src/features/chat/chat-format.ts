import { formatJalali, gregorianToJalali } from "@repo/jalali";

/** Day labels the caller translates. */
export type DayLabels = { today: string; yesterday: string };

const parseDay = (day: string) => {
  const [year = 1970, month = 1, day_ = 1] = day.split("-").map(Number);
  return { year, month, day: day_ };
};

/** `YYYY-MM-DD` of the day before. */
export function previousDay(day: string): string {
  const { year, month, day: date } = parseDay(day);
  return new Date(Date.UTC(year, month - 1, date - 1)).toISOString().slice(0, 10);
}

/**
 * A day divider: "Today", "Yesterday", else the date — Jalali in Persian
 * ("چهارشنبه ۱ فروردین"), Gregorian otherwise ("Wednesday, March 20"); the year only when it
 * isn't the current one. `day` and `today` are `YYYY-MM-DD` (see `dayKey`).
 */
export function formatChatDay(day: string, today: string, locale: string, labels: DayLabels) {
  if (day === today) return labels.today;
  if (day === previousDay(today)) return labels.yesterday;
  const sameYear = day.slice(0, 4) === today.slice(0, 4);
  if (locale === "fa") {
    const jalali = gregorianToJalali(parseDay(day));
    const thisYear = gregorianToJalali(parseDay(today)).year === jalali.year;
    return formatJalali(jalali, thisYear ? "dddd D MMMM" : "dddd D MMMM YYYY", { locale: "fa" });
  }
  const { year, month, day: date } = parseDay(day);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, date)));
}

/** Hours and minutes in the reader's time zone (Persian digits in Persian). */
export function formatChatTime(iso: string, locale: string, timeZone?: string): string {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone }).format(
    new Date(iso),
  );
}
