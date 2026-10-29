"use client";

import { Skeleton } from "@repo/ui/components/skeleton";
import { CalendarDaysIcon, PartyPopperIcon } from "lucide-react";

import { useGreeting } from "../hooks/use-greeting";
import { WallClock } from "./wall-clock";

/** Hero banner: the greeting with the first name, today's date, the Nowruz chip and the wall clock. */
export function GreetingHero() {
  const { greeting, date, nowruz } = useGreeting();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-l from-primary/10 via-sky-500/10 to-card ring-1 ring-foreground/10 lg:col-span-6">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -start-16 -top-20 size-64 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/20" />
        <div className="absolute -end-10 -bottom-24 size-72 rounded-full bg-violet-400/20 blur-3xl dark:bg-violet-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(var(--foreground)_1px,transparent_1px)] [mask-image:linear-gradient(to_left,black,transparent)] [background-size:22px_22px] opacity-[0.05]" />
      </div>
      <div className="relative flex flex-col items-center gap-6 p-5 sm:flex-row sm:justify-between sm:px-8 sm:py-6">
        <div className="flex flex-col items-center gap-4 text-center sm:items-start sm:text-start">
          {greeting === null ? (
            <Skeleton className="h-10 w-64" />
          ) : (
            <h2
              data-testid="greeting"
              className="font-heading text-3xl leading-10 font-bold sm:text-4xl sm:leading-10"
            >
              {greeting}
            </h2>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {date === null || nowruz === null ? (
              <Skeleton className="h-7 w-72" />
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDaysIcon className="size-4" aria-hidden />
                  {date}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                  <PartyPopperIcon className="size-3.5" aria-hidden />
                  {nowruz}
                </span>
              </>
            )}
          </div>
        </div>
        <WallClock />
      </div>
    </section>
  );
}
