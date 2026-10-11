/**
 * Pure rules behind the Jalali calendar components (selection, bounds, keyboard, visible months).
 * No React here, so every rule is unit-tested in `jalali-calendar.test.ts`.
 */
import {
  addJalaliDays,
  compareJalali,
  jalaliMonthLength,
  jalaliWeekday,
  MAX_JALALI_YEAR,
  MIN_JALALI_YEAR,
  type JalaliDate,
} from "@repo/jalali";

/** A picked range; `to` is missing while the user still has to pick the last day. */
export type JalaliRange = { from?: JalaliDate; to?: JalaliDate };

/** A calendar month: `{ year: 1403, month: 1 }`. */
export type JalaliMonth = { year: number; month: number };

/** First and last selectable day of a calendar. */
export type CalendarBounds = { first: JalaliDate; last: JalaliDate };

/**
 * The widest bounds: the month grid of -61/01 and 3177/12 needs days outside the range that
 * `@repo/jalali` supports, so those two months are never shown.
 */
const WIDEST: CalendarBounds = {
  first: { year: MIN_JALALI_YEAR, month: 2, day: 1 },
  last: { year: MAX_JALALI_YEAR, month: 11, day: 30 },
};

export function monthIndex({ year, month }: JalaliMonth): number {
  return year * 12 + month - 1;
}

export function monthFromIndex(index: number): JalaliMonth {
  const year = Math.floor(index / 12);
  return { year, month: index - year * 12 + 1 };
}

export function isSameMonth(a: JalaliMonth, b: JalaliMonth): boolean {
  return a.year === b.year && a.month === b.month;
}

/** `min`/`max` narrowed to what the calendar can show. */
export function calendarBounds(min?: JalaliDate, max?: JalaliDate): CalendarBounds {
  return {
    first: min && compareJalali(min, WIDEST.first) > 0 ? min : WIDEST.first,
    last: max && compareJalali(max, WIDEST.last) < 0 ? max : WIDEST.last,
  };
}

export function isOutOfBounds(date: JalaliDate, bounds: CalendarBounds): boolean {
  return compareJalali(date, bounds.first) < 0 || compareJalali(date, bounds.last) > 0;
}

export function clampDate(date: JalaliDate, bounds: CalendarBounds): JalaliDate {
  if (compareJalali(date, bounds.first) < 0) return bounds.first;
  if (compareJalali(date, bounds.last) > 0) return bounds.last;
  return date;
}

/** The first visible month, moved so that the `count` visible months stay inside `bounds`. */
export function clampAnchor(
  anchor: JalaliMonth,
  count: number,
  bounds: CalendarBounds,
): JalaliMonth {
  const lowest = monthIndex(bounds.first);
  const highest = Math.max(lowest, monthIndex(bounds.last) - count + 1);
  return monthFromIndex(Math.min(Math.max(monthIndex(anchor), lowest), highest));
}

/** `count` consecutive months starting at `anchor`. */
export function monthsInView(anchor: JalaliMonth, count: number): JalaliMonth[] {
  return Array.from({ length: count }, (_, offset) => monthFromIndex(monthIndex(anchor) + offset));
}

/** The first visible month after moving to `date`: unchanged when `date` is already visible. */
export function anchorFor(date: JalaliDate, anchor: JalaliMonth, count: number): JalaliMonth {
  const index = monthIndex(date);
  if (index < monthIndex(anchor)) return monthFromIndex(index);
  if (index > monthIndex(anchor) + count - 1) return monthFromIndex(index - count + 1);
  return anchor;
}

/**
 * The range after clicking `date`: the first click sets `from`, the second sets `to`, the third
 * starts a new range. A day before `from` restarts the range from that day.
 */
export function nextRange(range: JalaliRange | undefined, date: JalaliDate): JalaliRange {
  const from = range?.from;
  if (!from || range.to || compareJalali(date, from) < 0) return { from: date };
  return { from, to: date };
}

export type RangeFlags = {
  selected: boolean;
  rangeStart: boolean;
  rangeEnd: boolean;
  rangeMiddle: boolean;
};

/** Where `date` sits in a range; a single selected date is a one-day range. */
export function rangeFlags(date: JalaliDate, range: JalaliRange): RangeFlags {
  const { from } = range;
  if (!from) return { selected: false, rangeStart: false, rangeEnd: false, rangeMiddle: false };
  const afterStart = compareJalali(date, from);
  const beforeEnd = compareJalali(date, range.to ?? from);
  const rangeStart = afterStart === 0;
  const rangeEnd = beforeEnd === 0;
  const rangeMiddle = afterStart > 0 && beforeEnd < 0;
  return { selected: rangeStart || rangeEnd || rangeMiddle, rangeStart, rangeEnd, rangeMiddle };
}

/** The range to draw: while only `from` is picked, the hovered day previews the end. */
export function previewRange(range: JalaliRange | undefined, hovered?: JalaliDate): JalaliRange {
  if (!range?.from) return {};
  if (range.to || !hovered || compareJalali(hovered, range.from) < 0) return range;
  return { from: range.from, to: hovered };
}

/** `date` moved by whole months, day clamped, never past the months a calendar can show. */
function shiftMonths(date: JalaliDate, months: number): JalaliDate {
  const index = Math.min(
    Math.max(monthIndex(date) + months, monthIndex(WIDEST.first)),
    monthIndex(WIDEST.last),
  );
  const { year, month } = monthFromIndex(index);
  return { year, month, day: Math.min(date.day, jalaliMonthLength(year, month)) };
}

/**
 * The day a key moves the focus to (grid keyboard pattern), or `undefined` for other keys.
 * In RTL the left arrow goes to the next day. Clamp the result to the calendar's bounds.
 */
export function dateForKey(
  date: JalaliDate,
  key: string,
  { rtl = false, shift = false }: { rtl?: boolean; shift?: boolean } = {},
): JalaliDate | undefined {
  switch (key) {
    case "ArrowRight":
      return addJalaliDays(date, rtl ? -1 : 1);
    case "ArrowLeft":
      return addJalaliDays(date, rtl ? 1 : -1);
    case "ArrowUp":
      return addJalaliDays(date, -7);
    case "ArrowDown":
      return addJalaliDays(date, 7);
    case "Home":
      return addJalaliDays(date, -jalaliWeekday(date));
    case "End":
      return addJalaliDays(date, 6 - jalaliWeekday(date));
    case "PageUp":
      return shiftMonths(date, shift ? -12 : -1);
    case "PageDown":
      return shiftMonths(date, shift ? 12 : 1);
    default:
      return undefined;
  }
}

/** Years listed in the year dropdown: the bounds, or 100 years around the shown year. */
export function yearOptions(
  anchorYear: number,
  bounds: CalendarBounds,
  explicit: { min: boolean; max: boolean },
): number[] {
  const from = explicit.min ? bounds.first.year : Math.max(bounds.first.year, anchorYear - 100);
  const to = explicit.max ? bounds.last.year : Math.min(bounds.last.year, anchorYear + 100);
  return Array.from({ length: to - from + 1 }, (_, offset) => from + offset);
}

/** Whether a whole month lies outside the bounds (its dropdown option is disabled). */
export function isMonthOutOfBounds(month: JalaliMonth, bounds: CalendarBounds): boolean {
  const index = monthIndex(month);
  return index < monthIndex(bounds.first) || index > monthIndex(bounds.last);
}
