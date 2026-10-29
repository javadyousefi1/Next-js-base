"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useTranslations } from "next-intl";

import { useToday } from "../hooks/use-today";

/** Today in three calendars, the day/week of the year, the Nowruz countdown and the year's progress. */
export function TodayCard() {
  const t = useTranslations("Dashboard.today");
  const today = useToday();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {today === null ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <>
            <p data-testid="jalali-date" className="font-heading text-lg font-medium">
              {today.jalali}
            </p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
              <dt className="text-muted-foreground">{t("gregorian")}</dt>
              <dd>{today.gregorian}</dd>
              <dt className="text-muted-foreground">{t("hijri")}</dt>
              <dd>{today.hijri}</dd>
              <dt className="text-muted-foreground">{t("dayOfYear")}</dt>
              <dd>{today.dayOfYear}</dd>
              <dt className="text-muted-foreground">{t("weekOfYear")}</dt>
              <dd>{today.weekOfYear}</dd>
            </dl>
            <p className="font-medium text-primary">{today.nowruz}</p>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("yearProgress")}</span>
                <span>{today.progressLabel}</span>
              </div>
              <div
                role="progressbar"
                aria-label={t("yearProgress")}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={today.progressPercent}
                className="h-1.5 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary"
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
