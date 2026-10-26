import { defineRouting } from "next-intl/routing";

/** The app is Persian only (right-to-left): `messages/fa.json` + `LOCALE_META`. */
export type AppLocale = "fa";

/**
 * Locale routing for a single language: no prefix in the URL (`/settings`, not `/fa/settings`;
 * next-intl rewrites to the `[locale]` segment internally and redirects `/fa/...` away), no
 * language cookie and no language switcher.
 */
export const routing = defineRouting({
  locales: ["fa"],
  defaultLocale: "fa",
  localePrefix: "never",
  localeCookie: false,
  alternateLinks: false,
});
