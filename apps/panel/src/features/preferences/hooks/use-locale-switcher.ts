"use client";

import { useLocale } from "next-intl";

import { useAppRouter } from "@/hooks/use-app-router";
import { LOCALE_META } from "@/i18n/locales";
import { usePathname } from "@/i18n/navigation";
import { canSwitchLocale, routing } from "@/i18n/routing";

export function useLocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useAppRouter();

  return {
    /** `false` when the app ships one language (`APP_DIRECTION` in routing.ts). */
    canSwitch: canSwitchLocale,
    locale,
    locales: routing.locales.map((value) => ({ value, label: LOCALE_META[value].label })),
    /** Accepts raw UI values; keeps the query string (table filters, pagination…). */
    switchTo: (next: unknown) => {
      const target = routing.locales.find((candidate) => candidate === next);
      if (target) router.replace(`${pathname}${window.location.search}`, { locale: target });
    },
  };
}
