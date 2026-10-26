import { connection } from "next/server";

/** Liveness/readiness probe (Docker HEALTHCHECK, load balancers). */
export async function GET() {
  await connection();

  return Response.json(
    { status: "ok", timestamp: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
