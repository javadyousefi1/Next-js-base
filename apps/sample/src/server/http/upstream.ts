import "server-only";
import { HttpClient } from "@repo/http";

import { env } from "@/env";
import { authorizationHeader } from "@/features/auth/auth.backend";

function createUpstreamClient(headers?: Record<string, string>): HttpClient {
  return new HttpClient({
    baseURL: env.API_BASE_URL,
    timeout: 10_000,
    headers,
  });
}

/**
 * Server-side client for the upstream REST API (`API_BASE_URL`). Only server code talks to the
 * upstream; the browser goes through the BFF (`/api/*`). Pass the response schema and get typed,
 * validated data back — errors are `ApiError`s labelled with the endpoint (`GET /stats`):
 *
 *   upstream.get(STATS_ENDPOINT, { schema: dashboardStatsResponse })
 */
export const upstream = createUpstreamClient();

/** Upstream client that sends the user's access token. */
export function upstreamFor(accessToken: string): HttpClient {
  return createUpstreamClient(authorizationHeader(accessToken));
}
