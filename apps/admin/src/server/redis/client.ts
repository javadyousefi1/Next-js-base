import "server-only";
import { createClient } from "redis";

import { serverEnv } from "@/env/server";

function createRedisClient() {
  const client = createClient({
    url: serverEnv.REDIS_URL,
    keyPrefix: serverEnv.REDIS_KEY_PREFIX,
    disableOfflineQueue: true,
    socket: {
      connectTimeout: 2_000,
      // Back off up to 10s between reconnect attempts while Redis is down.
      reconnectStrategy: (retries: number) => Math.min(retries * 500, 10_000),
    },
  });
  client.on("error", (error: Error) => console.error("[redis]", error.message));
  client.connect().catch((error: Error) => console.error("[redis] connect failed:", error.message));
  return client;
}

type RedisClient = ReturnType<typeof createRedisClient>;

const globalForRedis = globalThis as typeof globalThis & { redisClient?: RedisClient };

/**
 * One Redis connection per server process, reused across requests and dev hot-reloads.
 *
 * - Connects lazily on first use and reconnects automatically (node-redis backoff).
 * - `disableOfflineQueue`: while disconnected, commands fail immediately instead of piling up,
 *   so a Redis outage degrades features (see `rateLimit`) instead of hanging requests.
 * - Every key is namespaced with `REDIS_KEY_PREFIX`.
 */
export function getRedis(): RedisClient {
  globalForRedis.redisClient ??= createRedisClient();
  return globalForRedis.redisClient;
}

export function isRedisReady(): boolean {
  return getRedis().isReady;
}
