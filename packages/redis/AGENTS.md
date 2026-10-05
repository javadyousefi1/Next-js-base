# packages/redis — AGENTS.md

`@repo/redis`: server-only Redis helpers (node-redis). Repository rules:
[`../../AGENTS.md`](../../AGENTS.md).

- `createRedisClient({ url, keyPrefix })` — resilient client: no offline queue, reconnects with
  backoff, logs errors. Apps keep ONE per process (`getRedis()` in `src/server/redis/client.ts`).
- `remember(redis, key, ttl, schema, load)` — validated cache-aside; falls back to `load()`.
- `rateLimit(redis, key, { limit, windowSeconds })` — fixed window; fails open when Redis is down.
- Every file starts with `import "server-only"`. No env here: the app passes the URL and prefix.
