import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ROUTES, type AppRoute } from "@/config/routes";
import { SITE } from "@/config/site";
import { env } from "@/env";
import { LOCALE_META } from "@/i18n/locales";
import type { AppLocale } from "@/i18n/routing";

/** An admin panel is never indexed — see also `app/robots.ts`. */
const robots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
};

/** Site-wide metadata (root layout). Pages extend it with `pageMetadata`. */
export async function rootMetadata(locale: AppLocale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
    applicationName: SITE.name,
    robots,
    alternates: { canonical: ROUTES.dashboard },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title: t("title"),
      description: t("description"),
      locale: LOCALE_META[locale].htmlLang.replace("-", "_"),
    },
    twitter: { card: "summary", title: t("title"), description: t("description") },
    formatDetection: { telephone: false },
  };
}

type PageNamespace =
  | "Dashboard"
  | "Users"
  | "InviteLinks"
  | "Settings"
  | "Profile"
  | "Auth"
  | "Register";

/** Per-page title/description/canonical from the page's i18n namespace. */
export async function pageMetadata(
  locale: AppLocale,
  namespace: PageNamespace,
  route: AppRoute,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: route },
  };
}
