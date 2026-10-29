"use client";

import { toPersianDigits } from "@repo/jalali";
import { useTranslations } from "next-intl";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

import {
  daysToNowruz,
  greetingPartForHour,
  jalaliDateText,
  jalaliToday,
  tehranTime,
} from "../dashboard-dates";
import { useNow } from "./use-now";

/** The hero's model: greeting with the first name, today's date and the Nowruz chip (`null` while unknown). */
export function useGreeting() {
  const t = useTranslations("Dashboard");
  const { user } = useCurrentUser();
  const now = useNow(60_000);

  if (!now || !user) return { greeting: null, date: null, nowruz: null };

  const part = greetingPartForHour(tehranTime(now).hour);
  const today = jalaliToday(now);
  const nowruzDays = daysToNowruz(today);
  return {
    greeting: t(`greeting.${part}`, { name: user.firstName }),
    date: jalaliDateText(today),
    nowruz:
      nowruzDays === 0
        ? t("today.nowruzToday")
        : t("today.nowruzIn", { days: toPersianDigits(nowruzDays) }),
  };
}
