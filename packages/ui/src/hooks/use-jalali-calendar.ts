"use client";

import {
  compareJalali,
  dateToJalali,
  epochDayToJalali,
  formatJalali,
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAY_NAMES,
  JALALI_WEEKDAY_SHORT_NAMES,
  jalaliMonthWeeks,
  jalaliToEpochDay,
  toPersianDigits,
  type JalaliDate,
} from "@repo/jalali";
import {
  anchorFor,
  calendarBounds,
  clampAnchor,
  clampDate,
  dateForKey,
  isMonthOutOfBounds,
  isOutOfBounds,
  isSameMonth,
  monthIndex,
  monthFromIndex,
  monthsInView,
  nextRange,
  previewRange,
  rangeFlags,
  yearOptions,
  type JalaliMonth,
  type JalaliRange,
  type RangeFlags,
} from "@repo/ui/lib/jalali-calendar";
import { type KeyboardEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";

/** Accessible names of the calendar controls (translate them in the app). */
export type JalaliCalendarLabels = {
  previousMonth: string;
  nextMonth: string;
  month: string;
  year: string;
};

const DEFAULT_LABELS: JalaliCalendarLabels = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  month: "Month",
  year: "Year",
};

/** Calendar options shared by the calendar and the date pickers. */
export type JalaliCalendarBaseOptions = {
  /** Month/weekday names and digits. Default `"fa"`. */
  locale?: "fa" | "en";
  /** First selectable day (inclusive). */
  min?: JalaliDate;
  /** Last selectable day (inclusive). */
  max?: JalaliDate;
  /** Month shown first when nothing is selected. Default: the current month. */
  defaultMonth?: JalaliMonth;
  /** Months side by side. Default 1. */
  numberOfMonths?: number;
  /** `"dropdown"`: month and year lists in the header (with one month only). Default `"label"`. */
  captionLayout?: "label" | "dropdown";
  labels?: Partial<JalaliCalendarLabels>;
};

type SingleSelection = {
  mode?: "single";
  selected?: JalaliDate | undefined;
  onSelect?: (date: JalaliDate) => void;
};

type RangeSelection = {
  mode: "range";
  selected?: JalaliRange | undefined;
  onSelect?: (range: JalaliRange) => void;
};

export type JalaliCalendarOptions = JalaliCalendarBaseOptions & (SingleSelection | RangeSelection);

/** One cell of the month grid, ready to render. */
export type JalaliCalendarDay = RangeFlags & {
  key: number;
  date: JalaliDate;
  /** Day number in the locale's digits. */
  text: string;
  /** Full date for screen readers: "چهارشنبه ۱ فروردین ۱۴۰۳". */
  label: string;
  /** A day of the previous/next month filling the first/last week. */
  outside: boolean;
  /** Outside days are left empty when several months are shown (they would repeat). */
  hidden: boolean;
  today: boolean;
  disabled: boolean;
  /** The one day in the Tab order (roving tabindex). */
  focusTarget: boolean;
};

const NOT_SELECTED: RangeFlags = {
  selected: false,
  rangeStart: false,
  rangeEnd: false,
  rangeMiddle: false,
};

const noSubscription = () => () => {};

/** Today as an epoch day; `undefined` during SSR and hydration so server and browser agree. */
function useTodayEpochDay(): number | undefined {
  return useSyncExternalStore(
    noSubscription,
    () => jalaliToEpochDay(dateToJalali(new Date())),
    () => undefined,
  );
}

/** State and handlers of `JalaliCalendar`: visible months, selection, keyboard focus. */
export function useJalaliCalendar(options: JalaliCalendarOptions) {
  const { locale = "fa", min, max, defaultMonth, numberOfMonths = 1, captionLayout } = options;
  const labels = { ...DEFAULT_LABELS, ...options.labels };
  const bounds = calendarBounds(min, max);
  const todayEpochDay = useTodayEpochDay();
  const today = todayEpochDay === undefined ? undefined : epochDayToJalali(todayEpochDay);

  const range: JalaliRange | undefined =
    options.mode === "range"
      ? options.selected
      : options.selected && { from: options.selected, to: options.selected };

  const [shownMonth, setShownMonth] = useState<JalaliMonth>();
  const [focused, setFocused] = useState<JalaliDate>();
  const [hovered, setHovered] = useState<JalaliDate>();
  const rootRef = useRef<HTMLDivElement>(null);
  const focusPending = useRef(false);

  const wantedMonth = shownMonth ?? range?.from ?? defaultMonth ?? today;
  const anchor = wantedMonth && clampAnchor(wantedMonth, numberOfMonths, bounds);
  const visible = anchor ? monthsInView(anchor, numberOfMonths) : [];

  // Moves DOM focus after a keyboard move has re-rendered the grid.
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    rootRef.current?.querySelector<HTMLElement>("[data-day-focus]")?.focus();
  });

  const isVisible = (date: JalaliDate) => visible.some((month) => isSameMonth(month, date));

  // A selection changed from outside (a "today" button, a form reset) brings its month into view.
  const selectedKey = range?.from && jalaliToEpochDay(range.from);
  const [lastSelectedKey, setLastSelectedKey] = useState(selectedKey);
  if (selectedKey !== lastSelectedKey) {
    setLastSelectedKey(selectedKey);
    if (range?.from && !isVisible(range.from)) setShownMonth(undefined);
  }

  const isSelectable = (date: JalaliDate) => isVisible(date) && !isOutOfBounds(date, bounds);
  const firstOfView = anchor && clampDate({ ...anchor, day: 1 }, bounds);
  const focusTarget =
    [focused, range?.from, today].find((date) => date && isSelectable(date)) ?? firstOfView;
  const drawn = options.mode === "range" ? previewRange(range, hovered) : (range ?? {});
  const digits = (value: number) => (locale === "fa" ? toPersianDigits(value) : String(value));

  const months = visible.map((month) => ({
    key: monthIndex(month),
    title: formatJalali({ ...month, day: 1 }, "MMMM YYYY", { locale }),
    weeks: jalaliMonthWeeks(month.year, month.month).map((week) =>
      week.map((date): JalaliCalendarDay => {
        const outside = !isSameMonth(date, month);
        const hidden = outside && numberOfMonths > 1;
        return {
          ...(hidden ? NOT_SELECTED : rangeFlags(date, drawn)),
          key: jalaliToEpochDay(date),
          date,
          text: digits(date.day),
          label: formatJalali(date, "dddd D MMMM YYYY", { locale }),
          outside,
          hidden,
          today: today !== undefined && compareJalali(date, today) === 0,
          disabled: isOutOfBounds(date, bounds),
          focusTarget:
            !outside && focusTarget !== undefined && compareJalali(date, focusTarget) === 0,
        };
      }),
    ),
  }));

  const showMonth = (month: JalaliMonth) =>
    setShownMonth(clampAnchor(month, numberOfMonths, bounds));

  const moveFocus = (date: JalaliDate) => {
    const target = clampDate(date, bounds);
    setFocused(target);
    if (anchor) setShownMonth(anchorFor(target, anchor, numberOfMonths));
    focusPending.current = true;
  };

  const lastShown = anchor && monthFromIndex(monthIndex(anchor) + numberOfMonths - 1);
  const dropdown =
    anchor && captionLayout === "dropdown" && numberOfMonths === 1
      ? {
          month: {
            label: labels.month,
            value: anchor.month,
            options: JALALI_MONTH_NAMES[locale].map((name, index) => ({
              value: index + 1,
              label: name,
              disabled: isMonthOutOfBounds({ year: anchor.year, month: index + 1 }, bounds),
            })),
            onChange: (value: string) => showMonth({ year: anchor.year, month: Number(value) }),
          },
          year: {
            label: labels.year,
            value: anchor.year,
            options: yearOptions(anchor.year, bounds, { min: !!min, max: !!max }).map((year) => ({
              value: year,
              label: digits(year),
              disabled: false,
            })),
            onChange: (value: string) => showMonth({ year: Number(value), month: anchor.month }),
          },
        }
      : undefined;

  return {
    rootRef,
    months,
    weekdays: JALALI_WEEKDAY_SHORT_NAMES[locale].map((short, index) => ({
      short,
      long: JALALI_WEEKDAY_NAMES[locale][index] ?? short,
    })),
    dropdown,
    previousMonth: {
      label: labels.previousMonth,
      disabled: !anchor || monthIndex(anchor) <= monthIndex(bounds.first),
      onClick: () => anchor && showMonth(monthFromIndex(monthIndex(anchor) - 1)),
    },
    nextMonth: {
      label: labels.nextMonth,
      disabled: !lastShown || monthIndex(lastShown) >= monthIndex(bounds.last),
      onClick: () => anchor && showMonth(monthFromIndex(monthIndex(anchor) + 1)),
    },
    onDayClick: (date: JalaliDate) => {
      setFocused(date);
      if (anchor) setShownMonth(anchorFor(date, anchor, numberOfMonths));
      if (options.mode === "range") options.onSelect?.(nextRange(options.selected, date));
      else options.onSelect?.(date);
    },
    onDayKeyDown: (event: KeyboardEvent<HTMLElement>, date: JalaliDate) => {
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      const target = dateForKey(date, event.key, { rtl, shift: event.shiftKey });
      if (!target) return;
      event.preventDefault();
      moveFocus(target);
    },
    onDayHover: (date: JalaliDate | undefined) => {
      if (options.mode === "range") setHovered(date);
    },
  };
}
