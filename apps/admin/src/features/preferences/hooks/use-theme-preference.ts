"use client";

import { useIsClient } from "@repo/hooks/use-is-client";
import { useTheme } from "next-themes";

export const THEMES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEMES)[number];

/** next-themes binding; the theme is unknown on the server, so it is `undefined` until mounted. */
export function useThemePreference() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  return {
    theme: isClient ? THEMES.find((value) => value === theme) : undefined,
    /** Accepts raw UI values (select/radio callbacks); unknown values are ignored. */
    setTheme: (next: unknown) => {
      const value = THEMES.find((candidate) => candidate === next);
      if (value) setTheme(value);
    },
  };
}
