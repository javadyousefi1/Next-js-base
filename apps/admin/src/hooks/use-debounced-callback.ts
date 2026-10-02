"use client";

import { useCallback, useEffect, useRef } from "react";

import { useLatest } from "./use-latest";

/** Stable function that runs `callback` only after `delayMs` without new calls. */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs = 300,
) {
  const callbackRef = useLatest(callback);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return useCallback(
    (...args: TArgs) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callbackRef.current(...args), delayMs);
    },
    [callbackRef, delayMs],
  );
}
