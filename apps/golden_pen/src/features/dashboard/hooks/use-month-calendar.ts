"use client";

import {
  addJalaliMonths,
  compareJalali,
  JALALI_MONTH_NAMES,
  JALALI_WEEKDAY_SHORT_NAMES,
  jalaliMonthWeeks,
  jalaliWeekday,
  toPersianDigits,
  type JalaliDate,
} from "@repo/jalali";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { jalaliToday } from "../dashboard-dates";
import { solarHolidayKey } from "../dashboard-holidays";
import { useNow } from "./use-now";

const FRIDAY = 6;

/** The mini calendar's model: the visible month, its days (flags for today/holiday) and the paging. */
export function useMonthCalendar() {
  const t = useTranslations("Dashboard");
  const now = useNow(60_000);
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<JalaliDate | null>(null);

  const weekdays = JALALI_WEEKDAY_SHORT_NAMES.fa;
  if (!now) return null;

  const today = jalaliToday(now);
  const first = addJalaliMonths({ ...today, day: 1 }, offset);
  const holidayName = (date: JalaliDate) => {
    const key = solarHolidayKey(date);
    return key ? t(`holidays.${key}`) : undefined;
  };
  const selectedHoliday = selected ? holidayName(selected) : undefined;

  return {
    title: `${JALALI_MONTH_NAMES.fa[first.month - 1]} ${toPersianDigits(first.year)}`,
    weekdays,
    weeks: jalaliMonthWeeks(first.year, first.month).map((week) =>
      week.map((date) => {
        const name = holidayName(date);
        return {
          key: `${date.year}-${date.month}-${date.day}`,
          text: toPersianDigits(date.day),
          inMonth: date.month === first.month,
          isToday: compareJalali(date, today) === 0,
          isHoliday: name !== undefined || jalaliWeekday(date) === FRIDAY,
          holidayName: name,
          isSelected: selected !== null && compareJalali(date, selected) === 0,
          select: () => setSelected(date),
        };
      }),
    ),
    // Shown under the grid for the tapped day (Fridays have no name of their own).
    selectedNote: selected
      ? selectedHoliday
        ? t("calendar.holiday", { name: selectedHoliday })
        : jalaliWeekday(selected) === FRIDAY
          ? t("calendar.friday")
          : null
      : null,
    previous: () => setOffset((value) => value - 1),
    next: () => setOffset((value) => value + 1),
  };
}
