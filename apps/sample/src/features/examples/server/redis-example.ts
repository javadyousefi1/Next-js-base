import "server-only";
import { remember } from "@repo/redis";
import { z } from "zod";

import { getRedis } from "@/server/redis/client";

const CACHE_SECONDS = 20;
const cachedValueSchema = z.object({ computedAt: z.iso.datetime(), value: z.number().int() });

/**
 * `remember` (cache-aside in Redis, shared by every server instance): `load` runs once per
 * 20 seconds. When Redis is down it falls back to `load` on every call — the page still works.
 */
export async function getRedisExample() {
  const redis = getRedis();
  const cached = await remember(redis, "examples:value", CACHE_SECONDS, cachedValueSchema, () =>
    Promise.resolve({
      computedAt: new Date().toISOString(),
      value: Math.floor(Math.random() * 10_000),
    }),
  );
  return { connected: redis.isReady, ...cached };
}
