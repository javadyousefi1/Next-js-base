import { connection } from "next/server";

import { getRedis } from "@/server/redis/client";

/** Liveness/readiness probe (Docker HEALTHCHECK, load balancers). */
export async function GET() {
  await connection();
  const redis = getRedis();
  const redisStatus = redis.isReady
    ? await redis
        .ping()
        .then(() => "up")
        .catch(() => "down")
    : "down";

  return Response.json(
    { status: "ok", redis: redisStatus, timestamp: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
