"use server";

import { rateLimit, type RateLimitResult } from "@repo/redis";

import { getSessionUser } from "@/server/auth/access";
import { getRedis } from "@/server/redis/client";

/**
 * Server Action limited to 3 calls per 30 seconds per user with `rateLimit` (fixed window).
 * Without Redis it fails open (`connected: false`, always allowed).
 */
export async function pressRateLimitedButton(): Promise<RateLimitResult & { connected: boolean }> {
  const user = await getSessionUser();
  const redis = getRedis();
  const result = await rateLimit(redis, `examples:press:${user?.id ?? "anonymous"}`, {
    limit: 3,
    windowSeconds: 30,
  });
  return { ...result, connected: redis.isReady };
}
