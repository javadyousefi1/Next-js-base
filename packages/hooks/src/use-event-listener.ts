"use client";

import { useEffect } from "react";

import { useLatest } from "./use-latest";

/** Window event listener with an always-fresh handler (no re-subscribe on every render). */
export function useEventListener<TEvent extends keyof WindowEventMap>(
  event: TEvent,
  handler: (event: WindowEventMap[TEvent]) => void,
): void {
  const handlerRef = useLatest(handler);

  useEffect(() => {
    const listener = (nativeEvent: WindowEventMap[TEvent]) => handlerRef.current(nativeEvent);
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }, [event, handlerRef]);
}
