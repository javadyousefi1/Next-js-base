"use client";

import {
  dateToJalali,
  differenceInJalaliDays,
  formatJalali,
  jalaliToDate,
  type JalaliDate,
} from "@repo/jalali";
import type { JalaliRange } from "@repo/ui/lib/jalali-calendar";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { useJalaliPickerProps } from "@/hooks/use-jalali-picker-props";

/** State of the calendar page demos and the texts that describe the picked values. */
export function useCalendarShowcase() {
  const locale = useLocale();
  const t = useTranslations("Calendar");
  const format = useFormatter();
  const pickerProps = useJalaliPickerProps();
  const [day, setDay] = useState<JalaliDate>();
  const [date, setDate] = useState<JalaliDate>();
  const [range, setRange] = useState<JalaliRange>();

  const jalali = (value: JalaliDate) => formatJalali(value, "dddd D MMMM YYYY", { locale });
  // The global next-intl time zone is UTC, so the UTC midnight shows the same calendar day.
  const gregorian = (value: JalaliDate) =>
    format.dateTime(jalaliToDate(value, { utc: true }), { dateStyle: "full", calendar: "gregory" });
  const describe = (value: JalaliDate | undefined) =>
    value && { jalali: jalali(value), gregorian: gregorian(value) };

  return {
    /** Locale and translated labels for every calendar on the page. */
    pickerProps,
    day,
    setDay,
    selectToday: () => setDay(dateToJalali(new Date())),
    dayText: describe(day),
    date,
    setDate,
    dateText: describe(date),
    clearDate: () => setDate(undefined),
    range,
    setRange,
    rangeText: range?.from &&
      range.to && {
        from: describe(range.from),
        to: describe(range.to),
        length: t("days", { count: differenceInJalaliDays(range.to, range.from) + 1 }),
      },
    clearRange: () => setRange(undefined),
  };
}
