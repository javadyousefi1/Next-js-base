import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ROUTES, type AppRoute } from "@/config/routes";
import { SITE } from "@/config/site";
import { env } from "@/env";
import { LOCALE_META } from "@/i18n/locales";
import { routing, type AppLocale } from "@/i18n/routing";

/** `/` + `fa` → `/fa`, `/users` + `en` → `/en/users` */
export function localizedPath(locale: AppLocale, route: AppRoute): string {
  return route === ROUTES.dashboard ? `/${locale}` : `/${locale}${route}`;
}

/** hreflang alternates for a route (+ `x-default`). */
function languageAlternates(route: AppRoute) {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [LOCALE_META[locale].htmlLang, localizedPath(locale, route)]),
    ),
    "x-default": localizedPath(routing.defaultLocale, route),
  };
}

/**
 * Indexing is opt-in: `NEXT_PUBLIC_SITE_INDEXABLE=true` (production only). Admin panels and
 * preview deployments stay `noindex` by default — see also `app/robots.ts`.
 */
const robots: Metadata["robots"] = env.NEXT_PUBLIC_SITE_INDEXABLE
  ? { index: true, follow: true }
  : { index: false, follow: false, googleBot: { index: false, follow: false } };

/** Site-wide metadata (root layout). Pages extend it with `pageMetadata`. */
export async function rootMetadata(locale: AppLocale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
    applicationName: SITE.name,
    robots,
    alternates: { canonical: localizedPath(locale, ROUTES.dashboard) },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title: t("title"),
      description: t("description"),
      locale: LOCALE_META[locale].htmlLang.replace("-", "_"),
    },
    twitter: { card: "summary", title: t("title"), description: t("description") },
    appleWebApp: { capable: true, title: SITE.shortName, statusBarStyle: "default" },
    formatDetection: { telephone: false },
    icons: {
      icon: [{ url: "/icons/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    },
  };
}

type PageNamespace = "Dashboard" | "Users" | "Settings" | "Auth" | "Offline";

/** Per-page title/description/canonical/hreflang from the page's i18n namespace. */
export async function pageMetadata(
  locale: AppLocale,
  namespace: PageNamespace,
  route: AppRoute,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: localizedPath(locale, route), languages: languageAlternates(route) },
  };
}
