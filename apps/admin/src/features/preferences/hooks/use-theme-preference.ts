"use client";

import { useTheme } from "next-themes";

import { useIsClient } from "@/hooks/use-is-client";

export const THEMES = ["light", "dark", "system"] as const;
export type ThemePreference = (typeof THEMES)[number];

/** next-themes binding; the theme is unknown on the server, so it is `undefined` until mounted. */
export function useThemePreference() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  return {
    theme: isClient ? (theme as ThemePreference | undefined) : undefined,
    setTheme: (next: ThemePreference) => setTheme(next),
  };
}
