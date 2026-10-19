"use client";

import {
  addJalaliDays,
  addJalaliMonths,
  compareJalali,
  epochDayToJalali,
  formatJalali,
  gregorianToJalali,
  isLeapJalaliYear,
  isValidGregorianDate,
  isValidJalaliDate,
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAY_NAMES,
  JALALI_WEEKDAY_SHORT_NAMES,
  jalaliMonthLength,
  jalaliMonthWeeks,
  jalaliToEpochDay,
  jalaliToGregorian,
  jalaliWeekday,
  MAX_JALALI_YEAR,
  MIN_JALALI_YEAR,
  parseJalali,
  toLatinDigits,
  toPersianDigits,
  type GregorianDate,
  type JalaliDate,
} from "@repo/jalali";
import { useLocale, useTranslations } from "next-intl";
import { type ChangeEvent, useState } from "react";

const PATTERNS = ["YYYY/MM/DD", "dddd D MMMM YYYY", "D MMMM", "YY-M-D", "[Day] D [of] MMMM"];

/** `"2024-03-20"` (an `<input type="date">` value) → a valid Gregorian date, or `undefined`. */
function parseIsoDate(value: string): GregorianDate | undefined {
  const [year, month, day] = value.split("-").map(Number);
  const date = { year: year ?? Number.NaN, month: month ?? Number.NaN, day: day ?? Number.NaN };
  return isValidGregorianDate(date) ? date : undefined;
}

/** `undefined` instead of a `RangeError` (dates near the edges of the supported range). */
function safe<T>(compute: () => T): T | undefined {
  try {
    return compute();
  } catch {
    return undefined;
  }
}

/** A number input's change → an integer (empty or invalid → 0). */
const onNumber = (set: (value: number) => void) => (event: ChangeEvent<HTMLInputElement>) =>
  set(Math.trunc(Number(event.target.value)) || 0);

const iso = ({ year, month, day }: GregorianDate) =>
  [year, month, day]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0"))
    .join("-");

/** Every `@repo/jalali` function on two inputs (a Gregorian and a Jalali date). */
export function useJalaliToolsExample() {
  const t = useTranslations("Examples.jalali");
  const locale = useLocale();
  const [gregorianText, setGregorianText] = useState("2025-06-15");
  const [jalaliText, setJalaliText] = useState("۱۴۰۵/۰۷/۱۹");
  const [days, setDays] = useState(10);
  const [months, setMonths] = useState(1);
  const [digitsText, setDigitsText] = useState("1403/01/05 — ۱۴۰۳/۰۱/۰۵");

  const digits = (value: string | number) =>
    locale === "fa" ? toPersianDigits(value) : toLatinDigits(String(value));
  const format = (date: JalaliDate, pattern = "dddd D MMMM YYYY") =>
    formatJalali(date, pattern, { locale });
  const facts = (date: JalaliDate) => ({
    weekday: JALALI_WEEKDAY_NAMES[locale][jalaliWeekday(date)],
    leap: isLeapJalaliYear(date.year) ? t("converter.yes") : t("converter.no"),
    monthLength: digits(jalaliMonthLength(date.year, date.month)),
    epochDay: digits(jalaliToEpochDay(date)),
  });

  const gregorian = parseIsoDate(gregorianText);
  const fromGregorian = gregorian && safe(() => gregorianToJalali(gregorian));
  const jalali = parseJalali(jalaliText);
  const toGregorian = jalali && isValidJalaliDate(jalali) ? jalaliToGregorian(jalali) : undefined;
  const order = jalali && fromGregorian ? compareJalali(jalali, fromGregorian) : undefined;

  return {
    range: t("converter.range", { min: digits(MIN_JALALI_YEAR), max: digits(MAX_JALALI_YEAR) }),
    gregorian: {
      value: gregorianText,
      onChange: (event: ChangeEvent<HTMLInputElement>) => setGregorianText(event.target.value),
      result: fromGregorian && { text: format(fromGregorian), ...facts(fromGregorian) },
    },
    jalali: {
      value: jalaliText,
      onChange: (event: ChangeEvent<HTMLInputElement>) => setJalaliText(event.target.value),
      result:
        jalali && toGregorian ? { text: digits(iso(toGregorian)), ...facts(jalali) } : undefined,
    },
    math: jalali && {
      days: { value: days, onChange: onNumber(setDays) },
      months: { value: months, onChange: onNumber(setMonths) },
      plusDays: safe(() => format(addJalaliDays(jalali, days))),
      plusMonths: safe(() => format(addJalaliMonths(jalali, months))),
      order:
        order === undefined
          ? undefined
          : t(order < 0 ? "math.before" : order > 0 ? "math.after" : "math.same"),
      fromEpoch: safe(() => format(epochDayToJalali(jalaliToEpochDay(jalali) + 1000))),
    },
    formats: jalali
      ? PATTERNS.map((pattern) => ({
          pattern,
          fa: formatJalali(jalali, pattern, { locale: "fa" }),
          en: formatJalali(jalali, pattern, { locale: "en" }),
        }))
      : [],
    digits: {
      value: digitsText,
      onChange: (event: ChangeEvent<HTMLInputElement>) => setDigitsText(event.target.value),
      persian: toPersianDigits(digitsText),
      latin: toLatinDigits(digitsText),
    },
    grid: jalali && {
      title: `${JALALI_MONTH_NAMES[locale][jalali.month - 1]} ${digits(jalali.year)}`,
      weekdays: JALALI_WEEKDAY_SHORT_NAMES[locale],
      weeks: (safe(() => jalaliMonthWeeks(jalali.year, jalali.month)) ?? []).map((week) => ({
        key: jalaliToEpochDay(week[0] ?? jalali),
        days: week.map((day) => ({
          key: jalaliToEpochDay(day),
          text: digits(day.day),
          outside: day.month !== jalali.month,
          selected: compareJalali(day, jalali) === 0,
        })),
      })),
    },
  };
}
