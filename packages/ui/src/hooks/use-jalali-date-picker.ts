"use client";

import { formatJalali, type JalaliDate } from "@repo/jalali";
import { useRef, useState } from "react";

type Options = {
  value?: JalaliDate | undefined;
  onChange?: (value: JalaliDate) => void;
  locale?: "fa" | "en" | undefined;
};

/** Open state, trigger text and focus of `JalaliDatePicker`. */
export function useJalaliDatePicker({ value, onChange, locale = "fa" }: Options) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return {
    open,
    setOpen,
    contentRef,
    text: value && formatJalali(value, "D MMMM YYYY", { locale }),
    /** Opening focuses the selected (or today's) day instead of the first button. */
    initialFocus: () => contentRef.current?.querySelector<HTMLElement>("[data-day-focus]") ?? true,
    select: (date: JalaliDate) => {
      onChange?.(date);
      setOpen(false);
    },
  };
}
