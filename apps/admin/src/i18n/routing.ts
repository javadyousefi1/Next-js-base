import { defineRouting } from "next-intl/routing";

/**
 * Locale routing (prefix-based: `/en/...`, `/fa/...`).
 * To add a language: add it here, add `messages/<locale>.json`, add its metadata in `locales.ts`.
 */
export const routing = defineRouting({
  locales: ["en", "fa"],
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    // Remember the user's choice for a year (default is a session cookie).
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type AppLocale = (typeof routing.locales)[number];
