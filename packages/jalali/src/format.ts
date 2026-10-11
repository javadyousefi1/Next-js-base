import { jalaliWeekday } from "./calendar";
import { isValidJalaliDate, type JalaliDate } from "./convert";

/** Month names, index 0 = Farvardin. */
export const JALALI_MONTH_NAMES = {
  fa: [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ],
  en: [
    "Farvardin",
    "Ordibehesht",
    "Khordad",
    "Tir",
    "Mordad",
    "Shahrivar",
    "Mehr",
    "Aban",
    "Azar",
    "Dey",
    "Bahman",
    "Esfand",
  ],
} as const;

/** Weekday names, index 0 = Saturday (the first day of the Persian week). */
export const JALALI_WEEKDAY_NAMES = {
  fa: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنجشنبه", "جمعه"],
  en: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
} as const;

/** One- or two-letter weekday names for calendar headers, index 0 = Saturday. */
export const JALALI_WEEKDAY_SHORT_NAMES = {
  fa: ["ش", "ی", "د", "س", "چ", "پ", "ج"],
  en: ["Sa", "Su", "Mo", "Tu", "We", "Th", "Fr"],
} as const;

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

/** `"1403/01/05"` → `"۱۴۰۳/۰۱/۰۵"`. */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)] ?? digit);
}

/** Persian (۰–۹) and Arabic-Indic (٠–٩) digits → `0–9`; everything else is kept. */
export function toLatinDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) =>
    String(
      PERSIAN_DIGITS.includes(digit) ? PERSIAN_DIGITS.indexOf(digit) : ARABIC_DIGITS.indexOf(digit),
    ),
  );
}

type FormatOptions = {
  /** Month and weekday names. Default `"fa"`. */
  locale?: "fa" | "en";
  /** Default: Persian digits for `"fa"`, Latin for `"en"`. */
  digits?: "persian" | "latin";
};

const TOKENS = /\[([^\]]*)]|YYYY|YY|MMMM|MM|M|DD|D|dddd/g;
const pad = (value: number, length: number) => String(value).padStart(length, "0");

/**
 * Formats a Jalali date. Tokens: `YYYY` 1403 · `YY` 03 · `MMMM` فروردین · `MM` 01 · `M` 1 ·
 * `DD` 05 · `D` 5 · `dddd` چهارشنبه. Text in `[brackets]` is kept as is.
 * `formatJalali(d)` → `"۱۴۰۳/۰۱/۰۵"`; `formatJalali(d, "dddd D MMMM YYYY")` → `"... ۵ فروردین ۱۴۰۳"`.
 */
export function formatJalali(
  date: JalaliDate,
  pattern = "YYYY/MM/DD",
  { locale = "fa", digits = locale === "fa" ? "persian" : "latin" }: FormatOptions = {},
): string {
  if (!isValidJalaliDate(date)) {
    throw new RangeError(`Invalid Jalali date ${date.year}/${date.month}/${date.day}`);
  }
  const values: Record<string, string> = {
    YYYY: String(date.year),
    YY: pad(Math.abs(date.year) % 100, 2),
    MMMM: JALALI_MONTH_NAMES[locale][date.month - 1] ?? "",
    MM: pad(date.month, 2),
    M: String(date.month),
    DD: pad(date.day, 2),
    D: String(date.day),
  };
  const result = pattern.replace(TOKENS, (token, literal: string | undefined) => {
    if (literal !== undefined) return literal;
    if (token === "dddd") return JALALI_WEEKDAY_NAMES[locale][jalaliWeekday(date)] ?? "";
    return values[token] ?? token;
  });
  return digits === "persian" ? toPersianDigits(result) : result;
}

/**
 * Reads `year/month/day` typed by a user: `"1403/1/5"`, `"۱۴۰۳-۰۱-۰۵"`, `"1403.01.05"`.
 * Persian/Arabic digits and `/`, `-`, `.` separators are accepted; returns `null` when the text
 * is not a real Jalali date (`"1404/12/30"`, `"1403/13/01"`, `"hello"`).
 */
export function parseJalali(text: string): JalaliDate | null {
  const match = /^\s*(\d{1,4})\s*[/.-]\s*(\d{1,2})\s*[/.-]\s*(\d{1,2})\s*$/.exec(
    toLatinDigits(text),
  );
  if (!match) return null;
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  return isValidJalaliDate(date) ? date : null;
}
