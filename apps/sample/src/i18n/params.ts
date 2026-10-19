import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

import { routing, type AppLocale } from "./routing";

/** Reads `[locale]` from layout/page params; unknown locales render the 404 page. */
export async function getLocaleParam(params: Promise<{ locale: string }>): Promise<AppLocale> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  return locale;
}
