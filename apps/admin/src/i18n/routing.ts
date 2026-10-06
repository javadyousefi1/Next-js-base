import { defineRouting } from "next-intl/routing";

/** Every language the app has messages for (`messages/<locale>.json` + `LOCALE_META`). */
export type AppLocale = "en" | "fa";

type AppDirection = "ltr" | "rtl" | "both";

/**
 * The layout direction(s) this app ships — set it once per project:
 * - `"rtl"`  → right-to-left languages only (Persian); no language switcher
 * - `"ltr"`  → left-to-right languages only (English); no language switcher
 * - `"both"` → every language + the language switcher
 */
const APP_DIRECTION: AppDirection = "both";

/** Languages per direction; the first one is the default. */
const LOCALES_BY_DIRECTION: Record<AppDirection, readonly [AppLocale, ...AppLocale[]]> = {
  ltr: ["en"],
  rtl: ["fa"],
  both: ["en", "fa"],
};

const locales = LOCALES_BY_DIRECTION[APP_DIRECTION];

/**
 * Locale routing (prefix-based: `/en/...`, `/fa/...`).
 * To add a language: add it to `AppLocale` and `LOCALES_BY_DIRECTION`, add `messages/<locale>.json`
 * and its metadata in `locales.ts`.
 */
export const routing = defineRouting({
  locales,
  defaultLocale: locales[0],
  localePrefix: "always",
  localeCookie: {
    // Remember the user's choice for a year (default is a session cookie).
    maxAge: 60 * 60 * 24 * 365,
  },
});

/** More than one language → show the language switcher. */
export const canSwitchLocale = locales.length > 1;
