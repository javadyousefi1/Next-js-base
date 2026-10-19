"use client";

import type { JalaliCalendarBaseOptions } from "@repo/ui/hooks/use-jalali-calendar";
import { useLocale, useTranslations } from "next-intl";

/**
 * The app's locale and translated labels for every Jalali calendar and date picker:
 * `<JalaliDatePicker {...useJalaliPickerProps()} value={…} onChange={…} />`.
 */
export function useJalaliPickerProps() {
  const locale = useLocale();
  const t = useTranslations("DatePicker");

  return {
    locale,
    labels: {
      previousMonth: t("previousMonth"),
      nextMonth: t("nextMonth"),
      month: t("month"),
      year: t("year"),
    },
  } satisfies JalaliCalendarBaseOptions;
}
