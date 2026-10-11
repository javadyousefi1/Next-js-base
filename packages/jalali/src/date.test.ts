import { describe, expect, test } from "bun:test";

import { dateToJalali, jalaliToDate } from "./date";

describe("dateToJalali", () => {
  test("uses the calendar day in the given time zone (Tehran midnight = 20:30 UTC)", () => {
    const lastSecondOf1402 = new Date("2024-03-19T20:29:59Z");
    const firstSecondOf1403 = new Date("2024-03-19T20:30:00Z");
    expect(dateToJalali(lastSecondOf1402, { timeZone: "Asia/Tehran" })).toEqual({
      year: 1402,
      month: 12,
      day: 29,
    });
    expect(dateToJalali(firstSecondOf1403, { timeZone: "Asia/Tehran" })).toEqual({
      year: 1403,
      month: 1,
      day: 1,
    });
    // The same instant is still the 19th in UTC.
    expect(dateToJalali(firstSecondOf1403, { timeZone: "UTC" })).toEqual({
      year: 1402,
      month: 12,
      day: 29,
    });
  });

  test("without a time zone it reads the local calendar day", () => {
    const localNoon = new Date(2024, 2, 20, 12, 0, 0); // 2024-03-20 12:00 local
    expect(dateToJalali(localNoon)).toEqual({ year: 1403, month: 1, day: 1 });
  });

  test("rejects an invalid Date or time zone", () => {
    expect(() => dateToJalali(new Date("nope"))).toThrow(RangeError);
    expect(() => dateToJalali(new Date(), { timeZone: "Not/AZone" })).toThrow(RangeError);
  });
});

describe("jalaliToDate", () => {
  test("utc: midnight UTC of that day", () => {
    expect(jalaliToDate({ year: 1403, month: 1, day: 1 }, { utc: true }).toISOString()).toBe(
      "2024-03-20T00:00:00.000Z",
    );
  });

  test("default: midnight in the local time zone", () => {
    const date = jalaliToDate({ year: 1403, month: 1, day: 1 });
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2024, 2, 20]);
    expect([date.getHours(), date.getMinutes(), date.getSeconds()]).toEqual([0, 0, 0]);
  });

  test("round-trips with dateToJalali", () => {
    const jalali = { year: 1405, month: 7, day: 19 };
    expect(dateToJalali(jalaliToDate(jalali))).toEqual(jalali);
    expect(dateToJalali(jalaliToDate(jalali, { utc: true }), { timeZone: "UTC" })).toEqual(jalali);
  });

  test("rejects an invalid Jalali date", () => {
    expect(() => jalaliToDate({ year: 1404, month: 12, day: 30 })).toThrow(RangeError);
  });
});
