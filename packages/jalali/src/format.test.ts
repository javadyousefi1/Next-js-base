import { describe, expect, test } from "bun:test";

import {
  formatJalali,
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAY_NAMES,
  JALALI_WEEKDAY_SHORT_NAMES,
  parseJalali,
  toLatinDigits,
  toPersianDigits,
} from "./format";

const nowruz = { year: 1403, month: 1, day: 1 }; // a Wednesday

describe("digits", () => {
  test("toPersianDigits", () => {
    expect(toPersianDigits("1403/01/05")).toBe("۱۴۰۳/۰۱/۰۵");
    expect(toPersianDigits(1234567890)).toBe("۱۲۳۴۵۶۷۸۹۰");
    expect(toPersianDigits("abc")).toBe("abc");
  });

  test("toLatinDigits reads Persian and Arabic-Indic digits", () => {
    expect(toLatinDigits("۱۴۰۳/۰۱/۰۵")).toBe("1403/01/05");
    expect(toLatinDigits("١٤٠٣-٠١-٠٥")).toBe("1403-01-05");
    expect(toLatinDigits("۱2۳ text")).toBe("123 text");
    expect(toLatinDigits(toPersianDigits("0123456789"))).toBe("0123456789");
  });
});

describe("formatJalali", () => {
  test("default pattern with Persian digits", () => {
    expect(formatJalali(nowruz)).toBe("۱۴۰۳/۰۱/۰۱");
  });

  test("every token", () => {
    const date = { year: 1403, month: 8, day: 5 };
    const latin = { digits: "latin" } as const;
    expect(formatJalali(date, "YYYY YY MM M DD D", latin)).toBe("1403 03 08 8 05 5");
    expect(formatJalali(date, "MMMM", latin)).toBe("آبان");
    expect(formatJalali(nowruz, "dddd")).toBe("چهارشنبه");
  });

  test("long Persian date", () => {
    expect(formatJalali(nowruz, "dddd D MMMM YYYY")).toBe("چهارشنبه ۱ فروردین ۱۴۰۳");
  });

  test("English names with Latin digits; [text] is kept as is", () => {
    expect(formatJalali(nowruz, "dddd, D MMMM YYYY", { locale: "en" })).toBe(
      "Wednesday, 1 Farvardin 1403",
    );
    expect(formatJalali(nowruz, "[Year] YYYY [Month] M", { locale: "en" })).toBe(
      "Year 1403 Month 1",
    );
  });

  test("month names for all 12 months and weekday names for a whole week", () => {
    for (let month = 1; month <= 12; month++) {
      expect(formatJalali({ year: 1403, month, day: 1 }, "MMMM")).toBe(
        JALALI_MONTH_NAMES.fa[month - 1]!,
      );
      expect(formatJalali({ year: 1403, month, day: 1 }, "MMMM", { locale: "en" })).toBe(
        JALALI_MONTH_NAMES.en[month - 1]!,
      );
    }
    for (let day = 4; day <= 10; day++) {
      // 1403/01/04 is a Saturday
      expect(formatJalali({ year: 1403, month: 1, day }, "dddd")).toBe(
        JALALI_WEEKDAY_NAMES.fa[day - 4]!,
      );
    }
  });

  test("short weekday names line up with the full names", () => {
    for (const locale of ["fa", "en"] as const) {
      expect(JALALI_WEEKDAY_SHORT_NAMES[locale]).toHaveLength(7);
      JALALI_WEEKDAY_SHORT_NAMES[locale].forEach((short, index) => {
        expect(JALALI_WEEKDAY_NAMES[locale][index]?.startsWith(short)).toBe(true);
      });
    }
  });

  test("rejects an invalid date", () => {
    expect(() => formatJalali({ year: 1404, month: 12, day: 30 })).toThrow(RangeError);
  });
});

describe("parseJalali", () => {
  test.each([
    ["1403/01/05", { year: 1403, month: 1, day: 5 }],
    ["1403/1/5", { year: 1403, month: 1, day: 5 }],
    ["۱۴۰۳/۰۱/۰۵", { year: 1403, month: 1, day: 5 }],
    ["١٤٠٣-٠١-٠٥", { year: 1403, month: 1, day: 5 }],
    ["1403.12.30", { year: 1403, month: 12, day: 30 }],
    ["  1403 / 7 / 1  ", { year: 1403, month: 7, day: 1 }],
  ])("%p", (text, expected) => {
    expect(parseJalali(text)).toEqual(expected);
  });

  test.each([
    "1404/12/30",
    "1403/13/01",
    "1403/07/31",
    "1403/00/10",
    "1403-01",
    "hello",
    "",
    "1403/01/05x",
  ])("%p → null", (text) => {
    expect(parseJalali(text)).toBeNull();
  });

  test("round-trips with formatJalali", () => {
    const date = { year: 1405, month: 7, day: 19 };
    expect(parseJalali(formatJalali(date))).toEqual(date);
  });
});
