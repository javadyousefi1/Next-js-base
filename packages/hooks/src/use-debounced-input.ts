"use client";

import { useEffect, useRef, useState } from "react";

import { useLatest } from "./use-latest";

/**
 * A text input bound to a committed value (URL state, a store…): typing shows at once and
 * `onCommit` runs after `delayMs` without typing, or at once on blur. A new `value` from outside
 * (a reset, back/forward) replaces what is shown and drops a pending commit.
 */
export function useDebouncedInput(value: string, onCommit: (value: string) => void, delayMs = 300) {
  const [text, setText] = useState(value);
  const [shownValue, setShownValue] = useState(value);
  const [ownCommit, setOwnCommit] = useState<string | null>(null);
  const latest = useLatest({ text, value, onCommit });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // State adjusted while rendering (no effect) when the committed value changes.
  if (value !== shownValue) {
    setShownValue(value);
    // Our own commit coming back keeps what was typed since; anything else replaces the text.
    if (value === ownCommit) setOwnCommit(null);
    else setText(value);
  }

  const commit = (next: string) => {
    clearTimeout(timer.current);
    if (next === latest.current.value) return;
    setOwnCommit(next);
    latest.current.onCommit(next);
  };

  return {
    value: text,
    onChange: (next: string) => {
      setText(next);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        // An outside change replaced the text in the meantime: drop this commit.
        if (latest.current.text === next) commit(next);
      }, delayMs);
    },
    /** Leaving the field commits at once, before a click elsewhere (e.g. "Clear filters") runs. */
    onBlur: () => commit(text),
  };
}
