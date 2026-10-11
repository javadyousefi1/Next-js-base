"use client";

import type { JalaliDate } from "@repo/jalali";
import { Button } from "@repo/ui/components/button";
import { JalaliCalendar } from "@repo/ui/components/jalali-calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui/components/popover";
import type { JalaliCalendarBaseOptions } from "@repo/ui/hooks/use-jalali-calendar";
import { useJalaliDatePicker } from "@repo/ui/hooks/use-jalali-date-picker";
import { cn } from "cn";
import { CalendarIcon } from "lucide-react";

export type JalaliDatePickerProps = Omit<JalaliCalendarBaseOptions, "numberOfMonths"> & {
  value?: JalaliDate | undefined;
  onChange?: (value: JalaliDate) => void;
  /** Trigger text while nothing is picked. */
  placeholder?: string;
  /** For `<Label htmlFor>`. */
  id?: string;
  disabled?: boolean;
  className?: string;
};

/** A button that opens a `JalaliCalendar` in a popover; picking a day closes it. */
function JalaliDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  id,
  disabled,
  className,
  captionLayout = "dropdown",
  ...calendarOptions
}: JalaliDatePickerProps) {
  const { open, setOpen, contentRef, text, initialFocus, select } = useJalaliDatePicker({
    value,
    onChange,
    locale: calendarOptions.locale,
  });

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
        <CalendarIcon data-icon="inline-start" />
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
          captionLayout={captionLayout}
          selected={value}
          onSelect={select}
        />
      </PopoverContent>
    </Popover>
  );
}

export { JalaliDatePicker };
