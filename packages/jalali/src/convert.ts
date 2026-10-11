/**
 * Gregorian ↔ Jalali (Solar Hijri, the official calendar of Iran) conversion. No dependencies.
 *
 * Leap years follow Kazimierz Borkowski's "The Persian calendar for 3000 years" (1996): break
 * years computed from the astronomical vernal equinox, so the dates match the official
 * (astronomical) calendar for Jalali years -61 to 3177 — the algorithm behind jalaali-js. The
 * Gregorian side is JavaScript's own proleptic Gregorian `Date.UTC`.
 *
 * All months are 1-based (Farvardin = 1, January = 1), unlike `Date#getMonth()`.
 */

/** A Jalali calendar date: `{ year: 1403, month: 1, day: 1 }` (month 1 = Farvardin). */
export type JalaliDate = { year: number; month: number; day: number };

/** A Gregorian calendar date: `{ year: 2024, month: 3, day: 20 }` (month 1 = January). */
export type GregorianDate = { year: number; month: number; day: number };

/** Jalali years where the leap-year pattern changes (Borkowski), and the supported range. */
const BREAKS = [
  -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394,
  2456, 3178,
] as const;

/** First and last supported Jalali year: the first break year and the year before the last. */
export const MIN_JALALI_YEAR = -61;
export const MAX_JALALI_YEAR = 3177;

const MS_PER_DAY = 86_400_000;
const div = (a: number, b: number) => Math.trunc(a / b);

/**
 * For a Jalali year: the Gregorian year it starts in, the day of March of its 1 Farvardin, and
 * how many years have passed since the last leap year (0 = this year is a leap year).
 */
function yearInfo(year: number) {
  if (!Number.isInteger(year) || year < MIN_JALALI_YEAR || year > MAX_JALALI_YEAR) {
    throw new RangeError(
      `Jalali year ${year} is outside the supported range ${MIN_JALALI_YEAR}..${MAX_JALALI_YEAR}`,
    );
  }

  let leapsJalali = -14;
  let previousBreak: number = BREAKS[0];
  let jump = 0;
  for (const nextBreak of BREAKS.slice(1)) {
    jump = nextBreak - previousBreak;
    if (year < nextBreak) break;
    leapsJalali += div(jump, 33) * 8 + div(jump % 33, 4);
    previousBreak = nextBreak;
  }

  let sinceBreak = year - previousBreak;
  leapsJalali += div(sinceBreak, 33) * 8 + div((sinceBreak % 33) + 3, 4);
  if (jump % 33 === 4 && jump - sinceBreak === 4) leapsJalali += 1;

  const gregorianYear = year + 621;
  const leapsGregorian = div(gregorianYear, 4) - div((div(gregorianYear, 100) + 1) * 3, 4) - 150;
  const marchDay = 20 + leapsJalali - leapsGregorian;

  if (jump - sinceBreak < 6) sinceBreak = sinceBreak - jump + div(jump + 4, 33) * 33;
  let yearsSinceLeap = (((sinceBreak + 1) % 33) - 1) % 4;
  if (yearsSinceLeap === -1) yearsSinceLeap = 4;

  return { gregorianYear, marchDay, yearsSinceLeap };
}

/** Days since 1970-01-01 of a Gregorian date (negative before it). */
function gregorianToEpochDay({ year, month, day }: GregorianDate): number {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day); // setUTCFullYear: years 0–99 are not shifted to 19xx
  return Math.round(date.getTime() / MS_PER_DAY);
}

function epochDayToGregorian(epochDay: number): GregorianDate {
  const date = new Date(epochDay * MS_PER_DAY);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

/** Is `year` a Jalali leap year (Esfand has 30 days)? */
export function isLeapJalaliYear(year: number): boolean {
  return yearInfo(year).yearsSinceLeap === 0;
}

/** Days in a Jalali month: 31 for months 1–6, 30 for 7–11, 29 or 30 (leap year) for Esfand. */
export function jalaliMonthLength(year: number, month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError(`Jalali month ${month} must be an integer from 1 to 12`);
  }
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  return isLeapJalaliYear(year) ? 30 : 29;
}

/** Is this a real Jalali date inside the supported range (e.g. 1403/12/30 yes, 1404/12/30 no)? */
export function isValidJalaliDate({ year, month, day }: JalaliDate): boolean {
  return (
    Number.isInteger(year) &&
    year >= MIN_JALALI_YEAR &&
    year <= MAX_JALALI_YEAR &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12 &&
    Number.isInteger(day) &&
    day >= 1 &&
    day <= jalaliMonthLength(year, month)
  );
}

/** Is this a real Gregorian date (e.g. 2024-02-29 yes, 2023-02-29 no)? */
export function isValidGregorianDate({ year, month, day }: GregorianDate): boolean {
  if (![year, month, day].every(Number.isInteger) || month < 1 || month > 12 || day < 1) {
    return false;
  }
  const date = epochDayToGregorian(gregorianToEpochDay({ year, month, day }));
  return date.year === year && date.month === month && date.day === day;
}

/** Days since 1970-01-01 of a Jalali date — handy for comparing and for date arithmetic. */
export function jalaliToEpochDay(date: JalaliDate): number {
  if (!isValidJalaliDate(date)) {
    throw new RangeError(`Invalid Jalali date ${date.year}/${date.month}/${date.day}`);
  }
  // Months 1–6 have 31 days, 7–12 have 30: the day of the year in one expression.
  const dayOfYear = (date.month - 1) * 31 - div(date.month, 7) * (date.month - 7) + date.day - 1;
  return nowruzEpochDay(date.year) + dayOfYear;
}

/** Days since 1970-01-01 of 1 Farvardin (Nowruz) of a Jalali year. */
function nowruzEpochDay(year: number): number {
  const { gregorianYear, marchDay } = yearInfo(year);
  return gregorianToEpochDay({ year: gregorianYear, month: 3, day: marchDay });
}

/** The Jalali date `epochDay` days after 1970-01-01. */
export function epochDayToJalali(epochDay: number): JalaliDate {
  if (!Number.isInteger(epochDay)) throw new RangeError(`Epoch day ${epochDay} is not an integer`);

  // Nowruz falls in March, so the Jalali year is Gregorian year − 621, or one less before Nowruz.
  let year = Math.min(epochDayToGregorian(epochDay).year - 621, MAX_JALALI_YEAR);
  let nowruz = nowruzEpochDay(year);
  if (epochDay < nowruz) {
    year -= 1;
    nowruz = nowruzEpochDay(year);
  }

  const dayOfYear = epochDay - nowruz;
  if (dayOfYear >= (isLeapJalaliYear(year) ? 366 : 365)) {
    throw new RangeError(`Epoch day ${epochDay} is after the last supported Jalali year`);
  }
  if (dayOfYear < 186) return { year, month: 1 + div(dayOfYear, 31), day: (dayOfYear % 31) + 1 };
  const rest = dayOfYear - 186;
  return { year, month: 7 + div(rest, 30), day: (rest % 30) + 1 };
}

/** Gregorian → Jalali: `{ year: 2024, month: 3, day: 20 }` → `{ year: 1403, month: 1, day: 1 }`. */
export function gregorianToJalali(date: GregorianDate): JalaliDate {
  if (!isValidGregorianDate(date)) {
    throw new RangeError(`Invalid Gregorian date ${date.year}-${date.month}-${date.day}`);
  }
  return epochDayToJalali(gregorianToEpochDay(date));
}

/** Jalali → Gregorian: `{ year: 1403, month: 1, day: 1 }` → `{ year: 2024, month: 3, day: 20 }`. */
export function jalaliToGregorian(date: JalaliDate): GregorianDate {
  return epochDayToGregorian(jalaliToEpochDay(date));
}
