"use client";

import { useEffect } from "react";

import { useLatest } from "./use-latest";

/** Declarative `setInterval`. Pass `null` as delay to pause. */
export function useInterval(callback: () => void, delayMs: number | null): void {
  const callbackRef = useLatest(callback);

  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => callbackRef.current(), delayMs);
    return () => clearInterval(id);
  }, [callbackRef, delayMs]);
}
