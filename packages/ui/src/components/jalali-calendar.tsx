"use client";

import { Button } from "@repo/ui/components/button";
import {
  useJalaliCalendar,
  type JalaliCalendarDay,
  type JalaliCalendarOptions,
} from "@repo/ui/hooks/use-jalali-calendar";
import { cn } from "cn";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

export type JalaliCalendarProps = JalaliCalendarOptions & { className?: string };

/**
 * Jalali (Solar Hijri) calendar: a single day (`mode="single"`, default) or a range
 * (`mode="range"`). Saturday-first weeks, RTL aware, keyboard: arrows, Home/End, PageUp/PageDown
 * (+Shift for a year). Values are `{ year, month, day }` objects from `@repo/jalali`.
 */
function JalaliCalendar({ className, ...options }: JalaliCalendarProps) {
  const {
    rootRef,
    months,
    weekdays,
    dropdown,
    previousMonth,
    nextMonth,
    onDayClick,
    onDayKeyDown,
    onDayHover,
  } = useJalaliCalendar(options);

  return (
    <div
      ref={rootRef}
      data-slot="jalali-calendar"
      className={cn("w-fit p-2 [--cell-size:--spacing(9)]", className)}
    >
      {months.length === 0 && (
        // Today is unknown during SSR: keep the space until the browser renders the month.
        <div aria-hidden className="h-[calc(var(--cell-size)*8)] w-[calc(var(--cell-size)*7)]" />
      )}
      <div className="flex flex-col gap-4 md:flex-row">
        {months.map((month, index) => (
          <div key={month.key} className="flex flex-col gap-2">
            <div className="flex h-(--cell-size) items-center justify-between gap-1">
              {index === 0 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-(--cell-size)"
                  aria-label={previousMonth.label}
                  disabled={previousMonth.disabled}
                  onClick={previousMonth.onClick}
                >
                  <ChevronLeftIcon className="rtl:rotate-180" />
                </Button>
              ) : (
                <span className="size-(--cell-size)" />
              )}
              {dropdown ? (
                <div className="flex items-center gap-1.5">
                  <CalendarSelect {...dropdown.month} />
                  <CalendarSelect {...dropdown.year} />
                </div>
              ) : (
                <div aria-live="polite" className="text-sm font-medium">
                  {month.title}
                </div>
              )}
              {index === months.length - 1 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-(--cell-size)"
                  aria-label={nextMonth.label}
                  disabled={nextMonth.disabled}
                  onClick={nextMonth.onClick}
                >
                  <ChevronRightIcon className="rtl:rotate-180" />
                </Button>
              ) : (
                <span className="size-(--cell-size)" />
              )}
            </div>
            <div role="grid" aria-label={month.title} className="flex flex-col gap-1">
              <div role="row" className="flex">
                {weekdays.map((weekday) => (
                  <div
                    key={weekday.long}
                    role="columnheader"
                    aria-label={weekday.long}
                    className="flex w-(--cell-size) items-center justify-center text-[0.8rem] font-normal text-muted-foreground select-none"
                  >
                    {weekday.short}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1" onMouseLeave={() => onDayHover(undefined)}>
                {month.weeks.map((week) => (
                  <div key={week[0]?.key} role="row" className="flex">
                    {week.map((day) => (
                      <CalendarDay
                        key={day.key}
                        day={day}
                        onClick={() => onDayClick(day.date)}
                        onKeyDown={(event) => onDayKeyDown(event, day.date)}
                        onMouseEnter={() => onDayHover(day.date)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarDay({
  day,
  ...handlers
}: {
  day: JalaliCalendarDay;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => void;
  onMouseEnter: () => void;
}) {
  const edge = day.rangeStart || day.rangeEnd;

  return (
    <div
      role="gridcell"
      aria-selected={day.selected || undefined}
      className={cn(
        "relative size-(--cell-size) p-0 text-center",
        day.rangeMiddle && "bg-muted",
        day.rangeStart && !day.rangeEnd && "rounded-s-md bg-muted",
        day.rangeEnd && !day.rangeStart && "rounded-e-md bg-muted",
      )}
    >
      {!day.hidden && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={day.label}
          aria-current={day.today ? "date" : undefined}
          tabIndex={day.focusTarget ? 0 : -1}
          data-day-focus={day.focusTarget || undefined}
          disabled={day.disabled}
          className={cn(
            "size-(--cell-size) rounded-md font-normal",
            day.today && !day.selected && "bg-muted font-medium",
            day.outside && !day.selected && "text-muted-foreground",
            day.rangeMiddle && "rounded-none bg-transparent hover:bg-transparent",
            edge &&
              "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
          )}
          {...handlers}
        >
          {day.text}
        </Button>
      )}
    </div>
  );
}

function CalendarSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: { value: number; label: string; disabled: boolean }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative rounded-md border border-input shadow-xs has-focus-visible:border-ring has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="flex h-7 items-center gap-1 ps-2 pe-1 text-sm font-medium select-none"
      >
        {options.find((option) => option.value === value)?.label}
        <ChevronDownIcon className="size-3.5 text-muted-foreground" />
      </span>
    </div>
  );
}

export { JalaliCalendar };
