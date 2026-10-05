import "server-only";
import type { RedisClient } from "./client";

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

/**
 * Fixed-window rate limiter (`INCR` + `EXPIRE NX`).
 * Fails open when Redis is unavailable: availability wins over throttling, and the outage is
 * already reported by the Redis client.
 */
export async function rateLimit(
  redis: RedisClient,
  key: string,
  { limit, windowSeconds }: { limit: number; windowSeconds: number },
): Promise<RateLimitResult> {
  if (!redis.isReady) return { allowed: true, remaining: limit, retryAfterSeconds: 0 };

  const redisKey = `rate-limit:${key}`;
  try {
    const count = await redis.incr(redisKey);
    await redis.expire(redisKey, windowSeconds, "NX");
    const ttl = await redis.ttl(redisKey);

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfterSeconds: count <= limit ? 0 : Math.max(ttl, 1),
    };
  } catch {
    return { allowed: true, remaining: limit, retryAfterSeconds: 0 };
  }
}
