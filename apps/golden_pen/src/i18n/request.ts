import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import * as rootParams from "next/root-params";

import { routing } from "./routing";

/**
 * Request-scoped i18n config. The locale comes from the `[locale]` root param
 * (`next/root-params`), which keeps pages statically renderable with Cache Components.
 * Route handlers / server actions pass `locale` explicitly (root params are unavailable there).
 */
export default getRequestConfig(async ({ locale }) => {
  let resolved = locale;

  if (!resolved) {
    const paramValue = await rootParams.locale();
    if (!hasLocale(routing.locales, paramValue)) notFound();
    resolved = paramValue;
  }

  return {
    locale: resolved,
    messages: (await import(`../../messages/${resolved}.json`)).default,
    timeZone: "UTC",
  };
});
