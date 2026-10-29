"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { CalendarDaysIcon, GlobeIcon, MoonIcon, SunMoonIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useToday } from "../hooks/use-today";

/** Today in three calendars, the day/week of the year, the Nowruz countdown and the year's progress. */
export function TodayCard() {
  const t = useTranslations("Dashboard.today");
  const today = useToday();

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SunMoonIcon className="size-4 text-amber-500" aria-hidden />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-5 text-sm">
        {today === null ? (
          <Skeleton className="h-72 w-full flex-1" />
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-xl bg-sky-500/10 p-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-300">
                <CalendarDaysIcon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{t("jalali")}</span>
                <span data-testid="jalali-date" className="font-heading text-lg font-semibold">
                  {today.jalali}
                </span>
              </div>
            </div>
            <dl className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <GlobeIcon className="size-4 text-emerald-500" aria-hidden />
                <dt className="w-16 text-muted-foreground">{t("gregorian")}</dt>
                <dd>{today.gregorian}</dd>
              </div>
              <div className="flex items-center gap-3">
                <MoonIcon className="size-4 text-violet-500" aria-hidden />
                <dt className="w-16 text-muted-foreground">{t("hijri")}</dt>
                <dd>{today.hijri}</dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs">{today.dayOfYear}</span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs">{today.weekOfYear}</span>
            </div>
            <div className="mt-auto flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("yearProgress")}</span>
                <span className="font-semibold">{today.progressLabel}</span>
              </div>
              <div
                role="progressbar"
                aria-label={t("yearProgress")}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={today.progressPercent}
                className="h-2.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-linear-to-l from-sky-500 via-violet-500 to-rose-500"
                  style={{ width: `${today.progressPercent}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
