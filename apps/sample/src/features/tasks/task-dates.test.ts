import { describe, expect, test } from "bun:test";

import { formatTaskDate, isoToJalali, jalaliToIso } from "./task-dates";

describe("task dates", () => {
  test("ISO date ↔ Jalali", () => {
    expect(isoToJalali("2026-03-21")).toEqual({ year: 1405, month: 1, day: 1 });
    expect(jalaliToIso({ year: 1405, month: 1, day: 1 })).toBe("2026-03-21");
    expect(jalaliToIso(isoToJalali("2024-02-29"))).toBe("2024-02-29");
  });

  test("timestamps use their UTC calendar day", () => {
    expect(isoToJalali("2026-03-20T23:59:59.000Z")).toEqual({ year: 1404, month: 12, day: 29 });
  });

  test("formats in both locales", () => {
    expect(formatTaskDate("2026-03-21", "fa")).toBe("۱ فروردین ۱۴۰۵");
    expect(formatTaskDate("2026-03-21T10:00:00.000Z", "en")).toBe("1 Farvardin 1405");
  });
});
