import "server-only";
import { env } from "@/env";
import { HttpClient } from "@/lib/http/http-client";

export function bearer(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

function createUpstreamClient(headers?: Record<string, string>): HttpClient {
  return new HttpClient({
    baseURL: env.API_BASE_URL,
    timeout: 10_000,
    headers,
    // MSW intercepts requests inside this process: a mocked upstream must never go through an
    // HTTP(S)_PROXY from the environment (the proxy would receive — and reject — the call).
    ...(env.API_MOCKING === "enabled" && { proxy: false as const }),
  });
}

/**
 * Server-side client for the upstream REST API (`API_BASE_URL`). Only server code talks to the
 * upstream; the browser goes through the BFF (`/api/*`). Pass the response schema and get typed,
 * validated data back — errors are `ApiError`s labelled with the endpoint (`GET /stats`):
 *
 *   upstream.get(API_ENDPOINTS.stats, { schema: dashboardStatsSchema })
 */
export const upstream = createUpstreamClient();

/** Upstream client that sends the user's access token (server prefetch, `<PrefetchBoundary>`). */
export function upstreamFor(accessToken: string): HttpClient {
  return createUpstreamClient(bearer(accessToken));
}
