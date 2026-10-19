import type { MetadataRoute } from "next";

import { PUBLIC_ROUTES, ROUTES } from "@/config/routes";
import { env } from "@/env";
import { LOCALE_META } from "@/i18n/locales";
import { routing } from "@/i18n/routing";
import { localizedPath } from "@/lib/seo/metadata";

const absolute = (path: string) => new URL(path, env.NEXT_PUBLIC_SITE_URL).toString();

/** Only public pages belong in the sitemap (everything else requires a session). */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!env.NEXT_PUBLIC_SITE_INDEXABLE) return [];

  return PUBLIC_ROUTES.filter((route) => route !== ROUTES.offline).map((route) => ({
    url: absolute(localizedPath(routing.defaultLocale, route)),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [
          LOCALE_META[locale].htmlLang,
          absolute(localizedPath(locale, route)),
        ]),
      ),
    },
  }));
}
