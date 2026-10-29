"use client";

import { useInterval } from "@repo/hooks/use-interval";
import { useState } from "react";

/**
 * The current time, refreshed every `intervalMs`; `null` until the browser has mounted, so the
 * server and the first client render match (views show a skeleton for `null`). The time is read
 * in an interval callback because Cache Components forbid reading it while prerendering.
 */
export function useNow(intervalMs: number): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  // Delay 0 until the first tick: the time is set right after mount, then every `intervalMs`.
  useInterval(() => setNow(new Date()), now === null ? 0 : intervalMs);

  return now;
}
