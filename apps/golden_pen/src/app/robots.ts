import type { MetadataRoute } from "next";

/** An admin panel is never indexed: everything is disallowed. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
