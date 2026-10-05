"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { z } from "zod";

const STORAGE_EVENT = "app:local-storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}

/**
 * Persistent state in localStorage, validated with a zod schema on every read (corrupted or
 * outdated values fall back to `defaultValue`). Synced across tabs.
 */
export function useLocalStorage<TSchema extends z.ZodType>(
  key: string,
  schema: TSchema,
  defaultValue: z.output<TSchema>,
) {
  const read = useCallback(() => window.localStorage.getItem(key), [key]);
  const raw = useSyncExternalStore(subscribe, read, () => null);

  let value: z.output<TSchema> = defaultValue;
  if (raw !== null) {
    try {
      const parsed = schema.safeParse(JSON.parse(raw));
      if (parsed.success) value = parsed.data;
    } catch {
      // invalid JSON → default value
    }
  }

  const setValue = useCallback(
    (next: z.output<TSchema>) => {
      window.localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event(STORAGE_EVENT));
    },
    [key],
  );

  const remove = useCallback(() => {
    window.localStorage.removeItem(key);
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, [key]);

  return [value, setValue, remove] as const;
}
