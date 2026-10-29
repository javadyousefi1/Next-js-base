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
    <Card className="gap-5 rounded-2xl shadow-sm">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="flex items-center gap-2">
          <SunMoonIcon className="size-4 text-muted-foreground" aria-hidden />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5 text-sm">
        {today === null ? (
          <Skeleton className="h-72 w-full flex-1" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/50 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-foreground ring-1 ring-border">
                <CalendarDaysIcon className="size-5" aria-hidden />
              </span>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{t("jalali")}</span>
                <span data-testid="jalali-date" className="font-heading text-lg font-semibold">
                  {today.jalali}
                </span>
              </div>
            </div>
            <dl className="grid gap-3">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-3.5">
                <GlobeIcon className="size-4 text-muted-foreground" aria-hidden />
                <dt className="w-16 text-muted-foreground">{t("gregorian")}</dt>
                <dd>{today.gregorian}</dd>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-3.5">
                <MoonIcon className="size-4 text-muted-foreground" aria-hidden />
                <dt className="w-16 text-muted-foreground">{t("hijri")}</dt>
                <dd>{today.hijri}</dd>
              </div>
            </dl>
            <div className="flex flex-col gap-4 sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-center text-xs text-muted-foreground">
                  {today.dayOfYear}
                </span>
                <span className="rounded-full border border-border/60 bg-muted/40 px-3 py-1.5 text-center text-xs text-muted-foreground">
                  {today.weekOfYear}
                </span>
              </div>
              <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
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
                  className="relative h-2 overflow-hidden rounded-full bg-muted after:pointer-events-none after:absolute after:inset-0 after:bg-[repeating-linear-gradient(to_left,transparent_0,transparent_calc(8.333%_-_1px),var(--card)_calc(8.333%_-_1px),var(--card)_8.333%)]"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${today.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
