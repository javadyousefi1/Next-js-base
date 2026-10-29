import { describe, expect, test } from "bun:test";

import {
  dailyIndex,
  dayOfJalaliYear,
  daysToNowruz,
  formatClock,
  greetingPartForHour,
  weekOfJalaliYear,
  yearProgressPercent,
} from "./dashboard-dates";
import { solarHolidayKey } from "./dashboard-holidays";

describe("greetingPartForHour", () => {
  test("splits the day at 5, 11, 15 and 19", () => {
    expect(greetingPartForHour(4)).toBe("night");
    expect(greetingPartForHour(5)).toBe("morning");
    expect(greetingPartForHour(10)).toBe("morning");
    expect(greetingPartForHour(11)).toBe("noon");
    expect(greetingPartForHour(14)).toBe("noon");
    expect(greetingPartForHour(15)).toBe("afternoon");
    expect(greetingPartForHour(18)).toBe("afternoon");
    expect(greetingPartForHour(19)).toBe("night");
    expect(greetingPartForHour(0)).toBe("night");
  });
});

describe("year helpers", () => {
  test("day and week of the year", () => {
    expect(dayOfJalaliYear({ year: 1404, month: 1, day: 1 })).toBe(1);
    expect(dayOfJalaliYear({ year: 1404, month: 2, day: 1 })).toBe(32);
    expect(weekOfJalaliYear({ year: 1404, month: 1, day: 7 })).toBe(1);
    expect(weekOfJalaliYear({ year: 1404, month: 1, day: 8 })).toBe(2);
  });

  test("progress is 100 on the last day", () => {
    expect(yearProgressPercent({ year: 1404, month: 12, day: 29 })).toBe(100);
    expect(yearProgressPercent({ year: 1404, month: 1, day: 1 })).toBeLessThan(1);
  });

  test("days to Nowruz", () => {
    expect(daysToNowruz({ year: 1404, month: 1, day: 1 })).toBe(0);
    expect(daysToNowruz({ year: 1404, month: 1, day: 2 })).toBe(364);
    expect(daysToNowruz({ year: 1404, month: 12, day: 29 })).toBe(1);
    // 1403 is a leap year: 30 Esfand exists.
    expect(daysToNowruz({ year: 1403, month: 12, day: 29 })).toBe(2);
  });

  test("dailyIndex stays inside the list", () => {
    expect(dailyIndex({ year: 1404, month: 12, day: 29 }, 8)).toBeLessThan(8);
  });
});

describe("solarHolidayKey", () => {
  test("finds fixed solar holidays", () => {
    expect(solarHolidayKey({ month: 1, day: 3 })).toBe("nowruz");
    expect(solarHolidayKey({ month: 1, day: 13 })).toBe("sizdahBedar");
    expect(solarHolidayKey({ month: 11, day: 22 })).toBe("revolution");
    expect(solarHolidayKey({ month: 12, day: 29 })).toBe("oil");
  });

  test("returns undefined for a working day", () => {
    expect(solarHolidayKey({ month: 1, day: 5 })).toBeUndefined();
  });
});

describe("formatClock", () => {
  test("Tehran time with Persian digits (UTC+3:30)", () => {
    expect(formatClock(new Date("2026-01-01T10:30:05Z"))).toBe("۱۴:۰۰:۰۵");
  });
});
