import { describe, expect, test } from "bun:test";

import { advanceAngles, clockAngles, continueAngle } from "./clock-angles";
import {
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

describe("clockAngles", () => {
  test("hands at Tehran 14:00:30 (10:30:30Z)", () => {
    const angles = clockAngles(new Date("2026-01-01T10:30:30Z"));
    expect(angles.second).toBe(180);
    expect(angles.minute).toBe(3);
    expect(angles.hour).toBeCloseTo(60.25, 5);
  });
});

describe("continueAngle", () => {
  test("keeps turning forward over 59 → 0", () => {
    expect(continueAngle(354, 0)).toBe(360);
    expect(continueAngle(360, 6)).toBe(366);
    expect(continueAngle(1074, 0)).toBe(1080);
  });

  test("does not move for the same angle", () => {
    expect(continueAngle(90, 90)).toBe(90);
    expect(continueAngle(450, 90)).toBe(450);
  });
});

describe("advanceAngles", () => {
  const target = { hour: 10, minute: 0, second: 0 };

  test("starts at the target", () => {
    expect(advanceAngles(null, target)).toEqual(target);
  });

  test("never moves a hand backwards", () => {
    expect(advanceAngles({ hour: 9, minute: 354, second: 354 }, target)).toEqual({
      hour: 10,
      minute: 360,
      second: 360,
    });
  });
});
