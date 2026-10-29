import { describe, expect, test } from "bun:test";

import { formatJalaliDate } from "./format-date";

describe("formatJalaliDate", () => {
  test("formats an ISO date as a Persian Jalali date", () => {
    expect(formatJalaliDate("2024-03-20T12:00:00Z")).toBe("۱۴۰۳/۰۱/۰۱");
  });

  test("uses Tehran time for the day", () => {
    // 21:00 UTC is already the next day in Tehran (UTC+3:30).
    expect(formatJalaliDate("2024-03-20T21:00:00Z")).toBe("۱۴۰۳/۰۱/۰۲");
  });

  test("returns a dash for null or an invalid date", () => {
    expect(formatJalaliDate(null)).toBe("—");
    expect(formatJalaliDate("not a date")).toBe("—");
  });
});
