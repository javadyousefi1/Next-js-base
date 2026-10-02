"use client";

import { useLocale } from "next-intl";

import { useAppRouter } from "@/hooks/use-app-router";
import { usePathname } from "@/i18n/navigation";
import { LOCALE_META } from "@/i18n/locales";
import { routing, type AppLocale } from "@/i18n/routing";

export function useLocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useAppRouter();

  return {
    locale,
    locales: routing.locales.map((value) => ({ value, label: LOCALE_META[value].label })),
    // Keep the query string (table filters, pagination…) when switching language.
    switchTo: (next: AppLocale) =>
      router.replace(`${pathname}${window.location.search}`, { locale: next }),
  };
}
