"use client";

import { formatClock } from "../dashboard-dates";
import { useNow } from "./use-now";

/** The live Tehran clock text (`۱۴:۰۵:۰۹`); `null` before hydration. */
export function useClock(): string | null {
  const now = useNow(1000);
  return now ? formatClock(now) : null;
}
