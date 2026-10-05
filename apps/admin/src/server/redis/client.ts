import "server-only";
import { createRedisClient, type RedisClient } from "@repo/redis";

import { env } from "@/env";

const globalForRedis = globalThis as typeof globalThis & { redisClient?: RedisClient };

/**
 * One Redis connection per server process, reused across requests and dev hot-reloads. Every key
 * is namespaced with `REDIS_KEY_PREFIX`. Pass it to the helpers from `@repo/redis`:
 * `rateLimit(getRedis(), key, opts)`, `remember(getRedis(), key, ttl, schema, load)`.
 */
export function getRedis(): RedisClient {
  globalForRedis.redisClient ??= createRedisClient({
    url: env.REDIS_URL,
    keyPrefix: env.REDIS_KEY_PREFIX,
  });
  return globalForRedis.redisClient;
}
