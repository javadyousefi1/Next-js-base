import type { MetadataRoute } from "next";

import { clientEnv } from "@/env/client";

/** Indexing is opt-in (`NEXT_PUBLIC_SITE_INDEXABLE=true`); everything else is disallowed. */
export default function robots(): MetadataRoute.Robots {
  if (!clientEnv.NEXT_PUBLIC_SITE_INDEXABLE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: new URL("/sitemap.xml", clientEnv.NEXT_PUBLIC_SITE_URL).toString(),
  };
}
