import type { MetadataRoute } from "next";

import { SITE } from "@/config/site";
import { routing } from "@/i18n/routing";

/** Web app manifest (served at /manifest.webmanifest, linked automatically). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: SITE.name,
    short_name: SITE.shortName,
    description: "Admin panel built on the Next.js base.",
    start_url: `/${routing.defaultLocale}`,
    scope: "/",
    display: "standalone",
    background_color: SITE.themeColor.light,
    theme_color: SITE.themeColor.light,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
