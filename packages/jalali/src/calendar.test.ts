import { describe, expect, test } from "bun:test";

import {
  addJalaliDays,
  addJalaliMonths,
  compareJalali,
  differenceInJalaliDays,
  jalaliMonthWeeks,
  jalaliWeekday,
} from "./calendar";
import {
  epochDayToJalali,
  jalaliMonthLength,
  jalaliToEpochDay,
  MAX_JALALI_YEAR,
  MIN_JALALI_YEAR,
} from "./convert";

const MS_PER_DAY = 86_400_000;

describe("jalaliWeekday", () => {
  test("1403/01/01 (2024-03-20) is a Wednesday = 4 in a Saturday-first week", () => {
    expect(jalaliWeekday({ year: 1403, month: 1, day: 1 })).toBe(4);
    expect(jalaliWeekday({ year: 1403, month: 1, day: 3 })).toBe(6); // Friday
    expect(jalaliWeekday({ year: 1403, month: 1, day: 4 })).toBe(0); // Saturday
  });

  test("agrees with Date#getUTCDay for every day of 30 years (and before 1970)", () => {
    const from = jalaliToEpochDay({ year: 1340, month: 1, day: 1 });
    for (let epochDay = from; epochDay < from + 30 * 366; epochDay++) {
      const jsDay = new Date(epochDay * MS_PER_DAY).getUTCDay(); // 0 = Sunday
      if (jalaliWeekday(epochDayToJalali(epochDay)) !== (jsDay + 1) % 7) {
        throw new Error(`weekday mismatch at epoch day ${epochDay}`);
      }
    }
  });
});

describe("addJalaliDays", () => {
  test("crosses month and year boundaries both ways", () => {
    expect(addJalaliDays({ year: 1403, month: 12, day: 30 }, 1)).toEqual({
      year: 1404,
      month: 1,
      day: 1,
    });
    expect(addJalaliDays({ year: 1404, month: 1, day: 1 }, -1)).toEqual({
      year: 1403,
      month: 12,
      day: 30,
    });
    expect(addJalaliDays({ year: 1404, month: 12, day: 29 }, 1)).toEqual({
      year: 1405,
      month: 1,
      day: 1,
    });
    expect(addJalaliDays({ year: 1403, month: 6, day: 31 }, 1)).toEqual({
      year: 1403,
      month: 7,
      day: 1,
    });
    expect(addJalaliDays({ year: 1403, month: 1, day: 1 }, 366)).toEqual({
      year: 1404,
      month: 1,
      day: 1,
    });
    expect(addJalaliDays({ year: 1403, month: 5, day: 10 }, 0)).toEqual({
      year: 1403,
      month: 5,
      day: 10,
    });
  });

  test("rejects invalid input", () => {
    expect(() => addJalaliDays({ year: 1403, month: 1, day: 1 }, 1.5)).toThrow(RangeError);
    expect(() => addJalaliDays({ year: 1404, month: 12, day: 30 }, 1)).toThrow(RangeError);
  });
});

describe("addJalaliMonths", () => {
  test("keeps the day when it exists, clamps it when it does not", () => {
    expect(addJalaliMonths({ year: 1403, month: 1, day: 15 }, 1)).toEqual({
      year: 1403,
      month: 2,
      day: 15,
    });
    expect(addJalaliMonths({ year: 1403, month: 6, day: 31 }, 1)).toEqual({
      year: 1403,
      month: 7,
      day: 30,
    });
    expect(addJalaliMonths({ year: 1403, month: 11, day: 30 }, 1)).toEqual({
      year: 1403,
      month: 12,
      day: 30,
    });
    expect(addJalaliMonths({ year: 1404, month: 11, day: 30 }, 1)).toEqual({
      year: 1404,
      month: 12,
      day: 29,
    });
    expect(addJalaliMonths({ year: 1403, month: 12, day: 30 }, 12)).toEqual({
      year: 1404,
      month: 12,
      day: 29,
    });
  });

  test("crosses years both ways", () => {
    expect(addJalaliMonths({ year: 1403, month: 12, day: 10 }, 1)).toEqual({
      year: 1404,
      month: 1,
      day: 10,
    });
    expect(addJalaliMonths({ year: 1403, month: 1, day: 15 }, -1)).toEqual({
      year: 1402,
      month: 12,
      day: 15,
    });
    expect(addJalaliMonths({ year: 1403, month: 3, day: 31 }, -15)).toEqual({
      year: 1401,
      month: 12,
      day: 29,
    });
    expect(addJalaliMonths({ year: 1403, month: 7, day: 1 }, 30)).toEqual({
      year: 1406,
      month: 1,
      day: 1,
    });
    expect(addJalaliMonths({ year: 1403, month: 7, day: 1 }, 0)).toEqual({
      year: 1403,
      month: 7,
      day: 1,
    });
  });

  test("rejects invalid input", () => {
    expect(() => addJalaliMonths({ year: 1403, month: 1, day: 1 }, 0.5)).toThrow(RangeError);
    expect(() => addJalaliMonths({ year: 1403, month: 13, day: 1 }, 1)).toThrow(RangeError);
  });
});

describe("differenceInJalaliDays / compareJalali", () => {
  test("counts days between dates", () => {
    const nowruz1403 = { year: 1403, month: 1, day: 1 };
    const nowruz1404 = { year: 1404, month: 1, day: 1 };
    expect(differenceInJalaliDays(nowruz1404, nowruz1403)).toBe(366);
    expect(differenceInJalaliDays(nowruz1403, nowruz1404)).toBe(-366);
    expect(differenceInJalaliDays(nowruz1403, nowruz1403)).toBe(0);
  });

  test("sorts dates", () => {
    const mehr = { year: 1403, month: 7, day: 1 };
    const esfand = { year: 1402, month: 12, day: 29 };
    const farvardin = { year: 1403, month: 1, day: 1 };
    expect([mehr, esfand, farvardin].toSorted(compareJalali)).toEqual([esfand, farvardin, mehr]);
    expect(compareJalali(mehr, { ...mehr })).toBe(0);
  });
});

describe("jalaliMonthWeeks", () => {
  test("1403/01 starts on a Wednesday: the first week begins on Saturday 1402/12/26", () => {
    const weeks = jalaliMonthWeeks(1403, 1);
    expect(weeks).toHaveLength(5);
    expect(weeks[0]?.[0]).toEqual({ year: 1402, month: 12, day: 26 });
    expect(weeks[0]?.[4]).toEqual({ year: 1403, month: 1, day: 1 });
    // 4 filler days + 31 days = exactly 5 weeks
    expect(weeks.at(-1)?.at(-1)).toEqual({ year: 1403, month: 1, day: 31 });
  });

  test("1403/02 starts on a Saturday and ends in a week filled with 1403/03", () => {
    const weeks = jalaliMonthWeeks(1403, 2);
    expect(weeks[0]?.[0]).toEqual({ year: 1403, month: 2, day: 1 });
    expect(weeks.at(-1)?.at(-1)).toEqual({ year: 1403, month: 3, day: 4 });
  });

  test("every month of 1300–1500: whole weeks of consecutive days, Saturday first, month covered", () => {
    for (let year = 1300; year <= 1500; year++) {
      for (let month = 1; month <= 12; month++) {
        const days = jalaliMonthWeeks(year, month).flat();
        const first = jalaliToEpochDay(days[0]!);
        const ok =
          days.length % 7 === 0 &&
          days.length >= 28 &&
          days.length <= 42 &&
          jalaliWeekday(days[0]!) === 0 &&
          days.every((day, index) => jalaliToEpochDay(day) === first + index) &&
          days.filter((day) => day.month === month).length === jalaliMonthLength(year, month) &&
          // no week made only of neighbouring days
          days.slice(0, 7).some((day) => day.month === month) &&
          days.slice(-7).some((day) => day.month === month);
        if (!ok) throw new Error(`bad grid for ${year}/${month}`);
      }
    }
  });

  test("throws only for the edge months of the supported range", () => {
    expect(() => jalaliMonthWeeks(MIN_JALALI_YEAR, 1)).toThrow(RangeError);
    expect(() => jalaliMonthWeeks(MAX_JALALI_YEAR, 12)).toThrow(RangeError);
    expect(jalaliMonthWeeks(MIN_JALALI_YEAR, 2).length).toBeGreaterThan(3);
    expect(jalaliMonthWeeks(MAX_JALALI_YEAR, 11).length).toBeGreaterThan(3);
    expect(() => jalaliMonthWeeks(1403, 13)).toThrow(RangeError);
  });
});
