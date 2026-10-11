import { describe, expect, test } from "bun:test";

import { MAX_JALALI_YEAR, MIN_JALALI_YEAR } from "@repo/jalali";

import {
  anchorFor,
  calendarBounds,
  clampAnchor,
  clampDate,
  dateForKey,
  isMonthOutOfBounds,
  isOutOfBounds,
  monthFromIndex,
  monthIndex,
  monthsInView,
  nextRange,
  previewRange,
  rangeFlags,
  yearOptions,
} from "./jalali-calendar";

const day = (year: number, month: number, dayOfMonth: number) => ({ year, month, day: dayOfMonth });

describe("months", () => {
  test("monthIndex and monthFromIndex are inverse, also for negative years", () => {
    for (const month of [
      { year: 1403, month: 1 },
      { year: 1403, month: 12 },
      { year: 0, month: 1 },
      { year: -1, month: 12 },
      { year: -61, month: 2 },
    ]) {
      expect(monthFromIndex(monthIndex(month))).toEqual(month);
    }
    expect(monthIndex({ year: 1404, month: 1 }) - monthIndex({ year: 1403, month: 12 })).toBe(1);
  });

  test("monthsInView crosses the year", () => {
    expect(monthsInView({ year: 1403, month: 12 }, 2)).toEqual([
      { year: 1403, month: 12 },
      { year: 1404, month: 1 },
    ]);
  });

  test("anchorFor keeps the view while the date is visible and moves it minimally otherwise", () => {
    const anchor = { year: 1403, month: 6 };
    expect(anchorFor(day(1403, 7, 3), anchor, 2)).toBe(anchor);
    expect(anchorFor(day(1403, 8, 1), anchor, 2)).toEqual({ year: 1403, month: 7 });
    expect(anchorFor(day(1403, 5, 31), anchor, 2)).toEqual({ year: 1403, month: 5 });
    expect(anchorFor(day(1405, 1, 1), anchor, 1)).toEqual({ year: 1405, month: 1 });
  });
});

describe("bounds", () => {
  const bounds = calendarBounds(day(1403, 2, 10), day(1403, 4, 20));

  test("min/max become the bounds; without them the edge months of @repo/jalali are excluded", () => {
    expect(bounds).toEqual({ first: day(1403, 2, 10), last: day(1403, 4, 20) });
    expect(calendarBounds()).toEqual({
      first: day(MIN_JALALI_YEAR, 2, 1),
      last: day(MAX_JALALI_YEAR, 11, 30),
    });
    expect(calendarBounds(day(MIN_JALALI_YEAR, 1, 5)).first).toEqual(day(MIN_JALALI_YEAR, 2, 1));
  });

  test("isOutOfBounds / clampDate are inclusive", () => {
    expect(isOutOfBounds(day(1403, 2, 9), bounds)).toBe(true);
    expect(isOutOfBounds(day(1403, 2, 10), bounds)).toBe(false);
    expect(isOutOfBounds(day(1403, 4, 20), bounds)).toBe(false);
    expect(isOutOfBounds(day(1403, 4, 21), bounds)).toBe(true);
    expect(clampDate(day(1400, 1, 1), bounds)).toEqual(day(1403, 2, 10));
    expect(clampDate(day(1410, 1, 1), bounds)).toEqual(day(1403, 4, 20));
    expect(clampDate(day(1403, 3, 3), bounds)).toEqual(day(1403, 3, 3));
  });

  test("clampAnchor keeps every visible month inside the bounds", () => {
    expect(clampAnchor({ year: 1402, month: 1 }, 1, bounds)).toEqual({ year: 1403, month: 2 });
    expect(clampAnchor({ year: 1404, month: 1 }, 1, bounds)).toEqual({ year: 1403, month: 4 });
    expect(clampAnchor({ year: 1404, month: 1 }, 2, bounds)).toEqual({ year: 1403, month: 3 });
    // bounds narrower than the view: start at the first month
    expect(clampAnchor({ year: 1404, month: 1 }, 6, bounds)).toEqual({ year: 1403, month: 2 });
  });

  test("isMonthOutOfBounds", () => {
    expect(isMonthOutOfBounds({ year: 1403, month: 1 }, bounds)).toBe(true);
    expect(isMonthOutOfBounds({ year: 1403, month: 2 }, bounds)).toBe(false);
    expect(isMonthOutOfBounds({ year: 1403, month: 4 }, bounds)).toBe(false);
    expect(isMonthOutOfBounds({ year: 1403, month: 5 }, bounds)).toBe(true);
  });

  test("yearOptions: explicit bounds, otherwise 100 years around the shown year", () => {
    expect(yearOptions(1403, bounds, { min: true, max: true })).toEqual([1403]);
    const around = yearOptions(1403, calendarBounds(), { min: false, max: false });
    expect([around[0], around.at(-1), around.length]).toEqual([1303, 1503, 201]);
    const edge = yearOptions(MIN_JALALI_YEAR + 3, calendarBounds(), { min: false, max: false });
    expect(edge[0]).toBe(MIN_JALALI_YEAR);
  });
});

describe("range selection", () => {
  test("first click starts, second ends, third restarts", () => {
    const start = nextRange(undefined, day(1403, 1, 5));
    expect(start).toEqual({ from: day(1403, 1, 5) });
    const full = nextRange(start, day(1403, 1, 12));
    expect(full).toEqual({ from: day(1403, 1, 5), to: day(1403, 1, 12) });
    expect(nextRange(full, day(1403, 2, 1))).toEqual({ from: day(1403, 2, 1) });
  });

  test("a day before the start restarts; the start itself makes a one-day range", () => {
    expect(nextRange({ from: day(1403, 1, 5) }, day(1403, 1, 2))).toEqual({
      from: day(1403, 1, 2),
    });
    expect(nextRange({ from: day(1403, 1, 5) }, day(1403, 1, 5))).toEqual({
      from: day(1403, 1, 5),
      to: day(1403, 1, 5),
    });
    expect(nextRange({}, day(1403, 1, 5))).toEqual({ from: day(1403, 1, 5) });
  });

  test("rangeFlags marks start, middle and end", () => {
    const range = { from: day(1403, 1, 30), to: day(1403, 2, 2) };
    expect(rangeFlags(day(1403, 1, 29), range).selected).toBe(false);
    expect(rangeFlags(day(1403, 1, 30), range)).toEqual({
      selected: true,
      rangeStart: true,
      rangeEnd: false,
      rangeMiddle: false,
    });
    expect(rangeFlags(day(1403, 1, 31), range).rangeMiddle).toBe(true);
    expect(rangeFlags(day(1403, 2, 2), range).rangeEnd).toBe(true);
    expect(rangeFlags(day(1403, 2, 3), range).selected).toBe(false);
    expect(rangeFlags(day(1403, 2, 3), {}).selected).toBe(false);
  });

  test("a single date (or a range without `to`) is both start and end", () => {
    expect(rangeFlags(day(1403, 1, 5), { from: day(1403, 1, 5) })).toEqual({
      selected: true,
      rangeStart: true,
      rangeEnd: true,
      rangeMiddle: false,
    });
  });

  test("previewRange extends an open range to the hovered day (not backwards)", () => {
    const open = { from: day(1403, 1, 5) };
    expect(previewRange(open, day(1403, 1, 9))).toEqual({
      from: day(1403, 1, 5),
      to: day(1403, 1, 9),
    });
    expect(previewRange(open, day(1403, 1, 1))).toBe(open);
    expect(previewRange(open)).toBe(open);
    const full = { from: day(1403, 1, 5), to: day(1403, 1, 6) };
    expect(previewRange(full, day(1403, 1, 9))).toBe(full);
    expect(previewRange(undefined, day(1403, 1, 9))).toEqual({});
  });
});

describe("dateForKey", () => {
  const wednesday = day(1403, 1, 1);

  test("arrows move by a day or a week; RTL swaps left and right", () => {
    expect(dateForKey(wednesday, "ArrowRight")).toEqual(day(1403, 1, 2));
    expect(dateForKey(wednesday, "ArrowLeft")).toEqual(day(1402, 12, 29));
    expect(dateForKey(wednesday, "ArrowRight", { rtl: true })).toEqual(day(1402, 12, 29));
    expect(dateForKey(wednesday, "ArrowLeft", { rtl: true })).toEqual(day(1403, 1, 2));
    expect(dateForKey(wednesday, "ArrowDown")).toEqual(day(1403, 1, 8));
    expect(dateForKey(wednesday, "ArrowUp")).toEqual(day(1402, 12, 23));
  });

  test("Home/End go to Saturday/Friday of the week", () => {
    expect(dateForKey(wednesday, "Home")).toEqual(day(1402, 12, 26));
    expect(dateForKey(wednesday, "End")).toEqual(day(1403, 1, 3));
  });

  test("PageUp/PageDown move a month (Shift: a year) with the day clamped", () => {
    expect(dateForKey(day(1403, 6, 31), "PageDown")).toEqual(day(1403, 7, 30));
    expect(dateForKey(day(1403, 1, 31), "PageUp")).toEqual(day(1402, 12, 29));
    expect(dateForKey(day(1403, 12, 30), "PageDown", { shift: true })).toEqual(day(1404, 12, 29));
    expect(dateForKey(day(1403, 5, 5), "PageUp", { shift: true })).toEqual(day(1402, 5, 5));
  });

  test("never leaves the months a calendar can show; other keys do nothing", () => {
    expect(dateForKey(day(MIN_JALALI_YEAR, 3, 1), "PageUp", { shift: true })).toEqual(
      day(MIN_JALALI_YEAR, 2, 1),
    );
    expect(dateForKey(day(MAX_JALALI_YEAR, 10, 1), "PageDown", { shift: true })).toEqual(
      day(MAX_JALALI_YEAR, 11, 1),
    );
    expect(dateForKey(wednesday, "Enter")).toBeUndefined();
    expect(dateForKey(wednesday, "a")).toBeUndefined();
  });
});
