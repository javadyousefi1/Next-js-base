"use client";

import { useTranslations } from "next-intl";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";

import { dailyIndex, greetingPartForHour, jalaliToday, tehranTime } from "../dashboard-dates";
import { useNow } from "./use-now";

const TIP_KEYS = ["tip0", "tip1", "tip2", "tip3", "tip4", "tip5", "tip6", "tip7"] as const;

/** The hero's model: the time-of-day greeting with the first name and today's tip (`null` while unknown). */
export function useGreeting() {
  const t = useTranslations("Dashboard");
  const { user } = useCurrentUser();
  const now = useNow(60_000);

  if (!now || !user) return { greeting: null, tip: null };

  const part = greetingPartForHour(tehranTime(now).hour);
  const tipKey = TIP_KEYS[dailyIndex(jalaliToday(now), TIP_KEYS.length)] ?? TIP_KEYS[0];
  return {
    greeting: t(`greeting.${part}`, { name: user.firstName }),
    tip: t(`tips.${tipKey}`),
  };
}
