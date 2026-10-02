import "server-only";
import type { z } from "zod";

import { getRedis } from "./client";

/**
 * Cache-aside helper shared by every server instance (unlike Next's in-memory `use cache`).
 * The value is validated with `schema` when read back, so a stale/foreign entry can never leak
 * a wrong shape. Falls back to `load()` when Redis is down.
 *
 * @example
 * const stats = await remember("stats", 60, statsSchema, () => fetchStats());
 */
export async function remember<TSchema extends z.ZodType>(
  key: string,
  ttlSeconds: number,
  schema: TSchema,
  load: () => Promise<z.output<TSchema>>,
): Promise<z.output<TSchema>> {
  const redis = getRedis();
  const redisKey = `cache:${key}`;

  if (redis.isReady) {
    const cached = await redis.get(redisKey).catch(() => null);
    if (cached) {
      const parsed = schema.safeParse(JSON.parse(cached));
      if (parsed.success) return parsed.data;
    }
  }

  const value = await load();
  if (redis.isReady) {
    await redis.set(redisKey, JSON.stringify(value), { EX: ttlSeconds }).catch(() => null);
  }
  return value;
}
