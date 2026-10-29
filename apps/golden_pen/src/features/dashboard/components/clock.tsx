"use client";

import { Skeleton } from "@repo/ui/components/skeleton";

import { useClock } from "../hooks/use-clock";

/** The live clock: a skeleton until the browser has hydrated (the time differs from the server's). */
export function Clock() {
  const clock = useClock();

  if (clock === null) return <Skeleton className="h-9 w-36" />;

  return (
    <time
      data-testid="clock"
      dir="ltr"
      className="font-heading text-3xl font-semibold tabular-nums"
    >
      {clock}
    </time>
  );
}
