import type { AppLocale } from "./routing";

type LocaleMeta = {
  /** Native name shown in the language switcher. */
  label: string;
  dir: "ltr" | "rtl";
  /** BCP 47 tag for `<html lang>` and Open Graph. */
  htmlLang: string;
};

export const LOCALE_META = {
  en: { label: "English", dir: "ltr", htmlLang: "en" },
  fa: { label: "فارسی", dir: "rtl", htmlLang: "fa-IR" },
} as const satisfies Record<AppLocale, LocaleMeta>;

export function getLocaleDirection(locale: AppLocale): LocaleMeta["dir"] {
  return LOCALE_META[locale].dir;
}
