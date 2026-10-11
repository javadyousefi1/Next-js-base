import { epochDayToJalali, jalaliMonthLength, jalaliToEpochDay, type JalaliDate } from "./convert";

/** Day of the Persian week: 0 = Saturday (شنبه) … 6 = Friday (جمعه). */
export function jalaliWeekday(date: JalaliDate): number {
  // 1970-01-01 (epoch day 0) was a Thursday = 5 in a Saturday-first week.
  return (((jalaliToEpochDay(date) + 5) % 7) + 7) % 7;
}

/**
 * The weeks (Saturday → Friday) that show a month in a calendar grid: 4–6 rows of 7 dates, the
 * first and last week filled with days of the neighbouring months.
 * Throws a `RangeError` for the very first and last supported months (-61/01 and 3177/12): their
 * filler days fall outside the supported range.
 */
export function jalaliMonthWeeks(year: number, month: number): JalaliDate[][] {
  const first = { year, month, day: 1 };
  const firstEpochDay = jalaliToEpochDay(first);
  const end = firstEpochDay + jalaliMonthLength(year, month);
  const weeks: JalaliDate[][] = [];
  for (let start = firstEpochDay - jalaliWeekday(first); start < end; start += 7) {
    weeks.push(Array.from({ length: 7 }, (_, index) => epochDayToJalali(start + index)));
  }
  return weeks;
}

/** `days` later (negative = earlier): 1403/12/30 + 1 → 1404/01/01. */
export function addJalaliDays(date: JalaliDate, days: number): JalaliDate {
  if (!Number.isInteger(days)) throw new RangeError(`Days ${days} must be an integer`);
  return epochDayToJalali(jalaliToEpochDay(date) + days);
}

/**
 * `months` later (negative = earlier). The day is clamped to the target month's length:
 * 1403/06/31 + 1 month → 1403/07/30, 1403/12/30 + 12 months → 1404/12/29.
 */
export function addJalaliMonths(date: JalaliDate, months: number): JalaliDate {
  if (!Number.isInteger(months)) throw new RangeError(`Months ${months} must be an integer`);
  jalaliToEpochDay(date); // validates the input date
  const monthIndex = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex - year * 12 + 1;
  return { year, month, day: Math.min(date.day, jalaliMonthLength(year, month)) };
}

/** `a - b` in days (positive when `a` is later). */
export function differenceInJalaliDays(a: JalaliDate, b: JalaliDate): number {
  return jalaliToEpochDay(a) - jalaliToEpochDay(b);
}

/** Sort order of two dates: -1 (`a` first), 0 (same day) or 1 — usable in `Array#sort`. */
export function compareJalali(a: JalaliDate, b: JalaliDate): -1 | 0 | 1 {
  const difference = differenceInJalaliDays(a, b);
  if (difference === 0) return 0;
  return difference < 0 ? -1 : 1;
}
