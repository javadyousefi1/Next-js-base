import "server-only";
import { createClient } from "redis";

type RedisClientOptions = {
  url: string;
  /** Namespaces every key (e.g. `"admin:"`). */
  keyPrefix: string;
};

/**
 * A Redis client that keeps the app available while Redis is down:
 *
 * - connects right away and reconnects with backoff (up to 10s between attempts)
 * - `disableOfflineQueue`: while disconnected, commands fail immediately instead of piling up,
 *   so callers degrade (`remember` loads, `rateLimit` fails open) instead of hanging requests
 * - errors are logged once per event, never thrown at the caller
 *
 * Create ONE per server process (keep it on `globalThis` to survive dev hot-reloads).
 */
export function createRedisClient({ url, keyPrefix }: RedisClientOptions) {
  const client = createClient({
    url,
    keyPrefix,
    disableOfflineQueue: true,
    socket: {
      connectTimeout: 2_000,
      reconnectStrategy: (retries: number) => Math.min(retries * 500, 10_000),
    },
  });
  client.on("error", (error: Error) => console.error("[redis]", error.message));
  client.connect().catch((error: Error) => console.error("[redis] connect failed:", error.message));
  return client;
}

export type RedisClient = ReturnType<typeof createRedisClient>;
