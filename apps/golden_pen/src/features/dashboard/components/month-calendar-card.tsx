"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useMonthCalendar } from "../hooks/use-month-calendar";

/** Mini Jalali calendar of the current month: today, Fridays and fixed solar holidays marked. */
export function MonthCalendarCard() {
  const t = useTranslations("Dashboard.calendar");
  const calendar = useMonthCalendar();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {calendar === null ? (
          <Skeleton className="h-60 w-full" />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("previousMonth")}
                onClick={calendar.previous}
              >
                <ChevronLeftIcon className="rtl:rotate-180" />
              </Button>
              <span aria-live="polite" className="text-sm font-medium">
                {calendar.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("nextMonth")}
                onClick={calendar.next}
              >
                <ChevronRightIcon className="rtl:rotate-180" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendar.weekdays.map((weekday) => (
                <span key={weekday} className="py-1 text-muted-foreground">
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
                      "rounded-md py-1.5 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
                      day.isHoliday && "text-destructive",
                      day.isToday &&
                        "bg-primary font-medium text-primary-foreground hover:bg-primary/90",
                      day.isSelected && !day.isToday && "bg-muted",
                    )}
                  >
                    {day.text}
                  </button>
                ) : (
                  <span key={day.key} aria-hidden />
                ),
              )}
            </div>
            <p className="min-h-5 text-xs text-destructive" aria-live="polite">
              {calendar.selectedNote}
            </p>
            <p className="text-xs text-muted-foreground">{t("note")}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
