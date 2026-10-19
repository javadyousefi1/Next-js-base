import type { MetadataRoute } from "next";

import { env } from "@/env";

/** Indexing is opt-in (`NEXT_PUBLIC_SITE_INDEXABLE=true`); everything else is disallowed. */
export default function robots(): MetadataRoute.Robots {
  if (!env.NEXT_PUBLIC_SITE_INDEXABLE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: new URL("/sitemap.xml", env.NEXT_PUBLIC_SITE_URL).toString(),
  };
}
