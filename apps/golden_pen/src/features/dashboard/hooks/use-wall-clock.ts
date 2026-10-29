"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { advanceAngles, clockAngles, type ClockAngles } from "../clock-angles";
import {
  formatHourMinute,
  greetingPartForHour,
  jalaliDateText,
  jalaliToday,
  tehranTime,
} from "../dashboard-dates";
import { useNow } from "./use-now";

/** The wall clock's model: hand angles that only grow, the digital time, day part and date; `null` before hydration. */
export function useWallClock() {
  const t = useTranslations("Dashboard.clock");
  const now = useNow(1000);
  const [seen, setSeen] = useState<Date | null>(null);
  const [angles, setAngles] = useState<ClockAngles | null>(null);

  // Adjust state while rendering (React's "derive from a changed value" pattern): each tick moves
  // the hands forward from where they were, so 59 → 0 never spins back.
  if (now && now !== seen) {
    setSeen(now);
    setAngles(advanceAngles(angles, clockAngles(now)));
  }

  if (!now || !angles) return null;

  const part = greetingPartForHour(tehranTime(now).hour);
  const time = formatHourMinute(now);
  return {
    angles,
    time,
    part,
    partLabel: t(`parts.${part}`),
    date: jalaliDateText(jalaliToday(now)),
    ariaLabel: t("ariaLabel", { time, part: t(`parts.${part}`) }),
  };
}
