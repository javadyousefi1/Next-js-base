import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * Server-only environment variables, validated with zod.
 *
 * - Validated at build time (imported by `next.config.ts`) and again at boot (`instrumentation.ts`).
 * - A missing/invalid key throws with a readable message. Never read `process.env` anywhere else
 *   (lint: `project/no-process-env`).
 * - `SKIP_ENV_VALIDATION=1` skips validation (Docker image build only; runtime still validates).
 * - Never import this file from a Client Component (lint: `project/no-server-import-in-client`).
 */
export const serverEnv = createEnv({
  server: {
    API_BASE_URL: z.url(),
    /** `enabled` → the upstream API is answered by MSW (`src/mocks`), no backend needed. */
    API_MOCKING: z.enum(["enabled", "disabled"]).default("disabled"),
    REDIS_URL: z.url(),
    REDIS_KEY_PREFIX: z.string().min(1).default("admin:"),
    AUTH_COOKIE_SECURE: z.stringbool().optional(),
    AUTH_ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    AUTH_REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().int().positive().default(604_800),
  },
  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  experimental__runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
  skipValidation: Boolean(process.env.SKIP_ENV_VALIDATION),
});

/** Secure cookies everywhere except plain-http local development. */
export const isSecureCookie = serverEnv.AUTH_COOKIE_SECURE ?? serverEnv.NODE_ENV === "production";
