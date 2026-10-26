import type { AppLocale } from "./routing";

type LocaleMeta = {
  dir: "ltr" | "rtl";
  /** BCP 47 tag for `<html lang>` and Open Graph. */
  htmlLang: string;
};

export const LOCALE_META = {
  fa: { dir: "rtl", htmlLang: "fa-IR" },
} as const satisfies Record<AppLocale, LocaleMeta>;

export function getLocaleDirection(locale: AppLocale): LocaleMeta["dir"] {
  return LOCALE_META[locale].dir;
}
