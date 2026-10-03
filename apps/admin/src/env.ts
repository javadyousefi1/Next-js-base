import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Every environment variable of the app, validated with zod. Import `env` — never read
 * `process.env` anywhere else (lint: `project/no-process-env`).
 *
 * - `server`: secrets and server-only settings. Reading one in the browser throws.
 * - `client`: `NEXT_PUBLIC_*` only. Inlined into the bundles at BUILD time (public; changing one
 *   needs a rebuild).
 * - Validated at build (`next.config.ts`) and at boot (`instrumentation.ts`): a missing/invalid
 *   key throws with a readable message.
 * - `SKIP_ENV_VALIDATION=1` skips validation (Docker image build only; the container validates
 *   when it starts).
 */
export const env = createEnv({
  server: {
    API_BASE_URL: z.url(),
    /** `enabled` → the upstream API is answered by MSW (`src/mocks`), no backend needed. */
    API_MOCKING: z.enum(["enabled", "disabled"]).default("disabled"),
    REDIS_URL: z.url(),
    REDIS_KEY_PREFIX: z.string().min(1).default("admin:"),
    /** Defaults to `true` in production (see `src/server/auth/cookies.ts`). */
    AUTH_COOKIE_SECURE: z.stringbool().optional(),
    AUTH_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    AUTH_REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(604_800),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url(),
    NEXT_PUBLIC_SITE_INDEXABLE: z.stringbool().default(false),
  },
  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  // Server values are read from `process.env`; client and shared ones must be written out so
  // Next.js can inline them.
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SITE_INDEXABLE: process.env.NEXT_PUBLIC_SITE_INDEXABLE,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});
