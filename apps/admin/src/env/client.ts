import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Public (browser-exposed) environment variables. Values are inlined at build time, so they are
 * always validated during `next build` — a missing key fails the build.
 */
export const clientEnv = createEnv({
  client: {
    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_SITE_INDEXABLE: z.stringbool().default(false),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_INDEXABLE: process.env.NEXT_PUBLIC_SITE_INDEXABLE,
  },
  emptyStringAsUndefined: true,
});
