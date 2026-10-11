"use client";

import { Button } from "@repo/ui/components/button";
import { JalaliCalendar } from "@repo/ui/components/jalali-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import type { JalaliCalendarBaseOptions } from "@repo/ui/hooks/use-jalali-calendar";
import { useJalaliDateRangePicker } from "@repo/ui/hooks/use-jalali-date-range-picker";
import type { JalaliRange } from "@repo/ui/lib/jalali-calendar";
import { cn } from "cn";
import { CalendarRangeIcon } from "lucide-react";

export type { JalaliRange };

export type JalaliDateRangePickerProps = JalaliCalendarBaseOptions & {
  value?: JalaliRange | undefined;
  /** Called with complete ranges only (`from` and `to`). */
  onChange?: (value: JalaliRange) => void;
  /** Trigger text while nothing is picked. */
  placeholder?: string;
  /** For `<Label htmlFor>`. */
  id?: string;
  disabled?: boolean;
  className?: string;
};

/** A button that opens a range `JalaliCalendar` (two months by default) in a popover. */
function JalaliDateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  id,
  disabled,
  className,
  numberOfMonths = 2,
  ...calendarOptions
}: JalaliDateRangePickerProps) {
  const { open, setOpen, contentRef, selected, text, initialFocus, select } =
    useJalaliDateRangePicker({ value, onChange, locale: calendarOptions.locale });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start text-start font-normal",
              !text && "text-muted-foreground",
              className,
            )}
          />
        }
      >
        <CalendarRangeIcon data-icon="inline-start" />
        {text ?? placeholder}
      </PopoverTrigger>
      <PopoverContent
        ref={contentRef}
        initialFocus={initialFocus}
        align="start"
        className="max-h-(--available-height) w-auto overflow-y-auto p-0"
      >
        <JalaliCalendar
          {...calendarOptions}
          mode="range"
          numberOfMonths={numberOfMonths}
          selected={selected}
          onSelect={select}
        />
      </PopoverContent>
    </Popover>
  );
}

export { JalaliDateRangePicker };
