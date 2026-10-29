import {
  differenceInJalaliDays,
  dateToJalali,
  isLeapJalaliYear,
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAY_NAMES,
  jalaliWeekday,
  toPersianDigits,
  type JalaliDate,
} from "@repo/jalali";

/** The dashboard works in Tehran time, whatever the browser's time zone is. */
export const TEHRAN_TIME_ZONE = "Asia/Tehran";

export type GreetingPart = "morning" | "noon" | "afternoon" | "night";

/** صبح 5–11, ظهر 11–15, عصر 15–19, شب 19–5. */
export function greetingPartForHour(hour: number): GreetingPart {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 15) return "noon";
  if (hour >= 15 && hour < 19) return "afternoon";
  return "night";
}

/** Hour (0–23), minute and second of an instant in Tehran. */
export function tehranTime(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TEHRAN_TIME_ZONE,
    hourCycle: "h23",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    numberingSystem: "latn",
  }).formatToParts(date);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  return { hour: read("hour"), minute: read("minute"), second: read("second") };
}

/** `۱۴:۰۵:۰۹` — the Tehran clock with Persian digits. */
export function formatClock(date: Date): string {
  const { hour, minute, second } = tehranTime(date);
  return [hour, minute, second]
    .map((value) => toPersianDigits(String(value).padStart(2, "0")))
    .join(":");
}

export function jalaliToday(date: Date): JalaliDate {
  return dateToJalali(date, { timeZone: TEHRAN_TIME_ZONE });
}

export function jalaliYearLength(year: number): number {
  return isLeapJalaliYear(year) ? 366 : 365;
}

/** 1-based: 1 Farvardin = 1. */
export function dayOfJalaliYear(date: JalaliDate): number {
  return differenceInJalaliDays(date, { year: date.year, month: 1, day: 1 }) + 1;
}

/** Counted in 7-day blocks from 1 Farvardin (not calendar weeks). */
export function weekOfJalaliYear(date: JalaliDate): number {
  return Math.ceil(dayOfJalaliYear(date) / 7);
}

/** Share of the year that has passed, 0–100, rounded (today counts as passed). */
export function yearProgressPercent(date: JalaliDate): number {
  return Math.round((dayOfJalaliYear(date) / jalaliYearLength(date.year)) * 100);
}

/** Days until the next 1 Farvardin; 0 on Nowruz day itself. */
export function daysToNowruz(date: JalaliDate): number {
  const isNowruz = date.month === 1 && date.day === 1;
  const year = isNowruz ? date.year : date.year + 1;
  return differenceInJalaliDays({ year, month: 1, day: 1 }, date);
}

/** `شنبه ۱۲ آبان ۱۴۰۵` — the weekday, day, month and year of a Jalali date. */
export function jalaliDateText(date: JalaliDate): string {
  const weekday = JALALI_WEEKDAY_NAMES.fa[jalaliWeekday(date)];
  const month = JALALI_MONTH_NAMES.fa[date.month - 1];
  return `${weekday} ${toPersianDigits(date.day)} ${month} ${toPersianDigits(date.year)}`;
}

/** `۱۴:۰۵` — the Tehran time without seconds, Persian digits. */
export function formatHourMinute(date: Date): string {
  const { hour, minute } = tehranTime(date);
  return [hour, minute].map((value) => toPersianDigits(String(value).padStart(2, "0"))).join(":");
}
