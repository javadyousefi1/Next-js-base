"use client";

import { formatJalali, type JalaliDate } from "@repo/jalali";
import type { JalaliRange } from "@repo/ui/lib/jalali-calendar";
import { useRef, useState } from "react";

type Options = {
  value?: JalaliRange | undefined;
  onChange?: (value: JalaliRange) => void;
  locale?: "fa" | "en" | undefined;
};

/**
 * Open state, trigger text and focus of `JalaliDateRangePicker`. The first click is kept as a
 * draft: `onChange` gets only complete ranges, and closing half-way keeps the previous value.
 */
export function useJalaliDateRangePicker({ value, onChange, locale = "fa" }: Options) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<JalaliRange>();
  const contentRef = useRef<HTMLDivElement>(null);
  const format = (date: JalaliDate) => formatJalali(date, "D MMMM YYYY", { locale });

  return {
    open,
    setOpen: (next: boolean) => {
      setOpen(next);
      if (!next) setDraft(undefined);
    },
    contentRef,
    selected: draft ?? value,
    text: value?.from && `${format(value.from)} – ${value.to ? format(value.to) : "…"}`,
    /** Opening focuses the first selected (or today's) day instead of the first button. */
    initialFocus: () => contentRef.current?.querySelector<HTMLElement>("[data-day-focus]") ?? true,
    select: (range: JalaliRange) => {
      if (!range.to) {
        setDraft(range);
        return;
      }
      setDraft(undefined);
      onChange?.(range);
      setOpen(false);
    },
  };
}
