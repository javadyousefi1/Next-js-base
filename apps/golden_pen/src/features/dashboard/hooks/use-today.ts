"use client";

import { toPersianDigits } from "@repo/jalali";
import { useTranslations } from "next-intl";

import {
  dayOfJalaliYear,
  jalaliDateText,
  jalaliToday,
  jalaliYearLength,
  TEHRAN_TIME_ZONE,
  weekOfJalaliYear,
  yearProgressPercent,
} from "../dashboard-dates";
import { useNow } from "./use-now";

const dateText = (locale: string, now: Date) =>
  new Intl.DateTimeFormat(locale, {
    timeZone: TEHRAN_TIME_ZONE,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

/** The today card's model; `null` before hydration. */
export function useToday() {
  const t = useTranslations("Dashboard.today");
  const now = useNow(60_000);
  if (!now) return null;

  const today = jalaliToday(now);

  return {
    jalali: jalaliDateText(today),
    gregorian: dateText("fa-IR-u-ca-gregory", now),
    // Hijri only: the Jalali date above comes from `@repo/jalali`.
    hijri: dateText("fa-IR-u-ca-islamic-umalqura", now),
    dayOfYear: t("dayOfYearValue", {
      day: toPersianDigits(dayOfJalaliYear(today)),
      total: toPersianDigits(jalaliYearLength(today.year)),
    }),
    weekOfYear: t("weekOfYearValue", { week: toPersianDigits(weekOfJalaliYear(today)) }),
    progressPercent: yearProgressPercent(today),
    progressLabel: `${toPersianDigits(yearProgressPercent(today))}٪`,
  };
}
