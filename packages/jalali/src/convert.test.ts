import { describe, expect, test } from "bun:test";

import {
  epochDayToJalali,
  gregorianToJalali,
  isLeapJalaliYear,
  isValidGregorianDate,
  isValidJalaliDate,
  jalaliMonthLength,
  jalaliToEpochDay,
  jalaliToGregorian,
  MAX_JALALI_YEAR,
  MIN_JALALI_YEAR,
} from "./convert";

const MS_PER_DAY = 86_400_000;
const epochDayOfUtc = (ms: number) => Math.round(ms / MS_PER_DAY);
const lastDay = (year: number) => ({ year, month: 12, day: jalaliMonthLength(year, 12) });

describe("known dates", () => {
  test.each([
    [
      { year: 2024, month: 3, day: 20 },
      { year: 1403, month: 1, day: 1 },
    ], // Nowruz 1403
    [
      { year: 2025, month: 3, day: 20 },
      { year: 1403, month: 12, day: 30 },
    ], // last day of leap 1403
    [
      { year: 2025, month: 3, day: 21 },
      { year: 1404, month: 1, day: 1 },
    ],
    [
      { year: 2023, month: 3, day: 21 },
      { year: 1402, month: 1, day: 1 },
    ],
    [
      { year: 2021, month: 3, day: 21 },
      { year: 1400, month: 1, day: 1 },
    ],
    [
      { year: 2020, month: 3, day: 20 },
      { year: 1399, month: 1, day: 1 },
    ],
    [
      { year: 1979, month: 2, day: 11 },
      { year: 1357, month: 11, day: 22 },
    ],
    [
      { year: 1981, month: 8, day: 17 },
      { year: 1360, month: 5, day: 26 },
    ],
    [
      { year: 2013, month: 1, day: 10 },
      { year: 1391, month: 10, day: 21 },
    ],
    [
      { year: 2026, month: 10, day: 11 },
      { year: 1405, month: 7, day: 19 },
    ],
    [
      { year: 622, month: 3, day: 22 },
      { year: 1, month: 1, day: 1 },
    ], // start of the era
  ])("%o ↔ %o", (gregorian, jalali) => {
    expect(gregorianToJalali(gregorian)).toEqual(jalali);
    expect(jalaliToGregorian(jalali)).toEqual(gregorian);
  });

  test("leap years around today match the official calendar (1403 → 1408 is a 5-year gap)", () => {
    const leapYears = Array.from({ length: 40 }, (_, i) => 1380 + i).filter(isLeapJalaliYear);
    expect(leapYears).toEqual([1383, 1387, 1391, 1395, 1399, 1403, 1408, 1412, 1416]);
  });
});

describe("against independent references", () => {
  test("every day 1178/01/01–1501/12/29 equals the runtime's ICU Persian calendar", () => {
    const icu = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const mismatches: string[] = [];
    const first = jalaliToEpochDay({ year: 1178, month: 1, day: 1 });
    const last = jalaliToEpochDay(lastDay(1501));
    for (let epochDay = first; epochDay <= last && mismatches.length < 5; epochDay++) {
      const parts = icu.formatToParts(epochDay * MS_PER_DAY);
      const icuPart = (type: string) => Number(parts.find((p) => p.type === type)?.value);
      const ours = epochDayToJalali(epochDay);
      if (
        ours.year !== icuPart("year") ||
        ours.month !== icuPart("month") ||
        ours.day !== icuPart("day")
      ) {
        mismatches.push(
          `${epochDay}: ${JSON.stringify(ours)} vs ICU ${icu.format(epochDay * MS_PER_DAY)}`,
        );
      }
    }
    expect(last - first).toBeGreaterThan(118_000);
    expect(mismatches).toEqual([]);
  });

  test("where ICU's 33-year arithmetic rule is a day off, the astronomical Nowruz wins", () => {
    // The equinox is 4–10 minutes from noon in Tehran in these years (see the astronomy test).
    expect(jalaliToGregorian({ year: 1177, month: 1, day: 1 })).toEqual({
      year: 1798,
      month: 3,
      day: 21,
    });
    expect(jalaliToGregorian({ year: 1503, month: 1, day: 1 })).toEqual({
      year: 2124,
      month: 3,
      day: 21,
    });
    expect(jalaliToGregorian({ year: 1602, month: 1, day: 1 })).toEqual({
      year: 2223,
      month: 3,
      day: 22,
    });
  });

  test("Nowruz follows the vernal equinox (before Tehran noon → that day) in 400–2300 SH", () => {
    let checked = 0;
    const mismatches: number[] = [];
    for (let year = 400; year <= 2300; year++) {
      const equinox = marchEquinoxUtcMs(year + 621) + TEHRAN_OFFSET_MS;
      const day = Math.floor(equinox / MS_PER_DAY);
      const minutesFromNoon = ((equinox / MS_PER_DAY - day) * 24 - 12) * 60;
      if (Math.abs(minutesFromNoon) <= 20) continue; // too close to noon to judge with Meeus + ΔT
      checked++;
      const nowruz = minutesFromNoon < 0 ? day : day + 1;
      if (jalaliToEpochDay({ year, month: 1, day: 1 }) !== nowruz) mismatches.push(year);
    }
    expect(checked).toBeGreaterThan(1800);
    expect(mismatches).toEqual([]);
  });
});

describe("the whole supported range", () => {
  test("every day round-trips Jalali ↔ epoch day ↔ Gregorian, and days follow each other", () => {
    const first = jalaliToEpochDay({ year: MIN_JALALI_YEAR, month: 1, day: 1 });
    const last = jalaliToEpochDay(lastDay(MAX_JALALI_YEAR));
    let previous = epochDayToJalali(first);
    expect(previous).toEqual({ year: MIN_JALALI_YEAR, month: 1, day: 1 });

    for (let epochDay = first + 1; epochDay <= last; epochDay++) {
      const date = epochDayToJalali(epochDay);
      const expected =
        previous.day < jalaliMonthLength(previous.year, previous.month)
          ? { ...previous, day: previous.day + 1 }
          : previous.month < 12
            ? { year: previous.year, month: previous.month + 1, day: 1 }
            : { year: previous.year + 1, month: 1, day: 1 };
      if (
        date.year !== expected.year ||
        date.month !== expected.month ||
        date.day !== expected.day
      ) {
        throw new Error(`${epochDay}: ${JSON.stringify(date)} after ${JSON.stringify(previous)}`);
      }
      if (jalaliToEpochDay(date) !== epochDay) throw new Error(`round-trip failed at ${epochDay}`);
      previous = date;
    }
    expect(previous).toEqual(lastDay(MAX_JALALI_YEAR));

    // Gregorian side, sampled every 997 days across the range.
    for (let epochDay = first; epochDay <= last; epochDay += 997) {
      const jalali = epochDayToJalali(epochDay);
      const gregorian = jalaliToGregorian(jalali);
      expect(epochDayOfUtc(Date.UTC(gregorian.year, gregorian.month - 1, gregorian.day))).toBe(
        epochDay,
      );
      expect(gregorianToJalali(gregorian)).toEqual(jalali);
    }
  }, 60_000);

  test("leap years are 4 or 5 years apart and give 366-day years", () => {
    let previousLeap: number | undefined;
    for (let year = MIN_JALALI_YEAR; year <= MAX_JALALI_YEAR; year++) {
      const leap = isLeapJalaliYear(year);
      if (year < MAX_JALALI_YEAR) {
        const length =
          jalaliToEpochDay({ year: year + 1, month: 1, day: 1 }) -
          jalaliToEpochDay({ year, month: 1, day: 1 });
        expect(length).toBe(leap ? 366 : 365);
      }
      if (!leap) continue;
      if (previousLeap !== undefined) expect([4, 5]).toContain(year - previousLeap);
      previousLeap = year;
    }
  }, 30_000);

  test("the first and last supported days convert; one day beyond throws", () => {
    const first = jalaliToEpochDay({ year: MIN_JALALI_YEAR, month: 1, day: 1 });
    const last = jalaliToEpochDay(lastDay(MAX_JALALI_YEAR));
    expect(() => epochDayToJalali(first - 1)).toThrow(RangeError);
    expect(() => epochDayToJalali(last + 1)).toThrow(RangeError);
    expect(() => isLeapJalaliYear(MIN_JALALI_YEAR - 1)).toThrow(RangeError);
    expect(() => isLeapJalaliYear(MAX_JALALI_YEAR + 1)).toThrow(RangeError);
  });
});

describe("months", () => {
  test("Farvardin–Shahrivar have 31 days, Mehr–Bahman 30, Esfand 29 or 30", () => {
    for (const month of [1, 2, 3, 4, 5, 6]) expect(jalaliMonthLength(1404, month)).toBe(31);
    for (const month of [7, 8, 9, 10, 11]) expect(jalaliMonthLength(1404, month)).toBe(30);
    expect(jalaliMonthLength(1403, 12)).toBe(30);
    expect(jalaliMonthLength(1404, 12)).toBe(29);
  });

  test("an invalid month throws", () => {
    for (const month of [0, 13, 1.5, Number.NaN]) {
      expect(() => jalaliMonthLength(1403, month)).toThrow(RangeError);
    }
  });
});

describe("validation", () => {
  test("isValidJalaliDate", () => {
    expect(isValidJalaliDate({ year: 1403, month: 12, day: 30 })).toBe(true);
    expect(isValidJalaliDate({ year: 1404, month: 12, day: 30 })).toBe(false); // not a leap year
    expect(isValidJalaliDate({ year: 1403, month: 7, day: 31 })).toBe(false);
    expect(isValidJalaliDate({ year: 1403, month: 13, day: 1 })).toBe(false);
    expect(isValidJalaliDate({ year: 1403, month: 0, day: 1 })).toBe(false);
    expect(isValidJalaliDate({ year: 1403, month: 1, day: 0 })).toBe(false);
    expect(isValidJalaliDate({ year: 1403.5, month: 1, day: 1 })).toBe(false);
    expect(isValidJalaliDate({ year: MAX_JALALI_YEAR + 1, month: 1, day: 1 })).toBe(false);
    expect(isValidJalaliDate({ year: Number.NaN, month: 1, day: 1 })).toBe(false);
  });

  test("isValidGregorianDate", () => {
    expect(isValidGregorianDate({ year: 2024, month: 2, day: 29 })).toBe(true);
    expect(isValidGregorianDate({ year: 2023, month: 2, day: 29 })).toBe(false);
    expect(isValidGregorianDate({ year: 1900, month: 2, day: 29 })).toBe(false); // century rule
    expect(isValidGregorianDate({ year: 2000, month: 2, day: 29 })).toBe(true);
    expect(isValidGregorianDate({ year: 2024, month: 4, day: 31 })).toBe(false);
    expect(isValidGregorianDate({ year: 2024, month: 13, day: 1 })).toBe(false);
    expect(isValidGregorianDate({ year: 2024, month: 1, day: 1.5 })).toBe(false);
  });

  test("conversions throw a RangeError for invalid input", () => {
    expect(() => jalaliToGregorian({ year: 1404, month: 12, day: 30 })).toThrow(RangeError);
    expect(() => gregorianToJalali({ year: 2023, month: 2, day: 29 })).toThrow(RangeError);
    expect(() => gregorianToJalali({ year: 9999, month: 1, day: 1 })).toThrow(RangeError);
    expect(() => epochDayToJalali(1.5)).toThrow(RangeError);
  });
});

// ── Astronomical reference: Meeus, "Astronomical Algorithms", ch. 27 (March equinox, years
// 1000–3000; checked against the published 2023–2026 equinoxes to within 2 minutes).
const TEHRAN_OFFSET_MS = 3.5 * 3_600_000; // Iran Standard Time, UTC+3:30
const TERMS = [
  [485, 324.96, 1934.136],
  [203, 337.23, 32964.467],
  [199, 342.08, 20.186],
  [182, 27.85, 445267.112],
  [156, 73.14, 45036.886],
  [136, 171.52, 22518.443],
  [77, 222.54, 65928.934],
  [74, 296.72, 3034.906],
  [70, 243.58, 9037.513],
  [58, 119.81, 33718.147],
  [52, 297.17, 150.678],
  [50, 21.02, 2281.226],
  [45, 247.54, 29929.562],
  [44, 325.15, 31555.956],
  [29, 60.93, 4443.417],
  [18, 155.12, 67555.328],
  [17, 288.79, 4562.452],
  [16, 198.04, 62894.029],
  [14, 199.76, 31436.921],
  [12, 95.39, 14577.848],
  [12, 287.11, 31931.756],
  [12, 320.81, 34777.259],
  [9, 227.73, 1222.114],
  [8, 15.45, 16859.074],
] as const;
const radians = (degrees: number) => (degrees * Math.PI) / 180;

function marchEquinoxUtcMs(gregorianYear: number): number {
  const y = (gregorianYear - 2000) / 1000;
  const jde0 =
    2451623.80984 + 365242.37404 * y + 0.05169 * y ** 2 - 0.00411 * y ** 3 - 0.00057 * y ** 4;
  const t = (jde0 - 2451545) / 36525;
  const w = 35999.373 * t - 2.47;
  const lambda = 1 + 0.0334 * Math.cos(radians(w)) + 0.0007 * Math.cos(radians(2 * w));
  const sum = TERMS.reduce((total, [a, b, c]) => total + a * Math.cos(radians(b + c * t)), 0);
  const jde = jde0 + (0.00001 * sum) / lambda;
  const u = (gregorianYear - 1820) / 100;
  const deltaTSeconds = -20 + 32 * u * u; // TT − UT, long-term estimate
  return (jde - 2440587.5) * MS_PER_DAY - deltaTSeconds * 1000;
}
