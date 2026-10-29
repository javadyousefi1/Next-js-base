"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, PartyPopperIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useMonthCalendar } from "../hooks/use-month-calendar";

/** Mini Jalali calendar of the current month: today, Fridays and fixed solar holidays marked. */
export function MonthCalendarCard() {
  const t = useTranslations("Dashboard.calendar");
  const calendar = useMonthCalendar();

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-sky-500" aria-hidden />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-80 flex-col gap-3">
        {calendar === null ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("previousMonth")}
                onClick={calendar.previous}
              >
                <ChevronRightIcon />
              </Button>
              <span aria-live="polite" className="font-heading text-base font-semibold">
                {calendar.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("nextMonth")}
                onClick={calendar.next}
              >
                <ChevronLeftIcon />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendar.weekdays.map((weekday) => (
                <span key={weekday} className="py-1 text-xs font-medium text-muted-foreground">
                  {weekday}
                </span>
              ))}
              {calendar.weeks.flat().map((day) =>
                day.inMonth ? (
                  <button
                    key={day.key}
                    type="button"
                    title={day.holidayName}
                    aria-current={day.isToday ? "date" : undefined}
                    onClick={day.select}
                    className={cn(
                      "relative mx-auto flex size-9 items-center justify-center rounded-full text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                      day.isHoliday && "font-medium text-rose-600 dark:text-rose-400",
                      day.isSelected && !day.isToday && "bg-muted ring-1 ring-foreground/15",
                      day.isToday &&
                        "bg-primary font-semibold text-primary-foreground shadow-sm hover:bg-primary/90",
                    )}
                  >
                    {day.text}
                    {day.isHoliday ? (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute bottom-1 size-1 rounded-full bg-rose-500",
                          day.isToday && "bg-rose-300",
                        )}
                      />
                    ) : null}
                  </button>
                ) : (
                  <span key={day.key} aria-hidden />
                ),
              )}
            </div>
            <div className="mt-auto flex flex-col gap-2">
              <div className="flex min-h-7 items-center" aria-live="polite">
                {calendar.selectedNote ? (
                  <span className="flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-medium text-rose-700 dark:text-rose-300">
                    <PartyPopperIcon className="size-3.5" aria-hidden />
                    {calendar.selectedNote}
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">{t("note")}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
