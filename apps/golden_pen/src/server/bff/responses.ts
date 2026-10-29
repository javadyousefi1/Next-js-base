import "server-only";
import { toApiError } from "@repo/http";
import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";

import { clearAuthCookies } from "@/server/auth/cookies";

const NO_STORE = { "Cache-Control": "no-store" };

/** Statuses that must not have a body (`Response.json` throws for them, e.g. a forwarded 204). */
const NULL_BODY_STATUSES = new Set([204, 205, 304]);

/** JSON response from a BFF route. */
export function bffJson(body: unknown, { status = 200 }: { status?: number } = {}): NextResponse {
  return NULL_BODY_STATUSES.has(status)
    ? new NextResponse(null, { status, headers: NO_STORE })
    : NextResponse.json(body, { status, headers: NO_STORE });
}

/** The `errors` array of an upstream error body (`undefined` when it has none). */
function upstreamErrors(details: unknown): unknown[] | undefined {
  if (!details || typeof details !== "object" || !("errors" in details)) return undefined;
  return Array.isArray(details.errors) ? (details.errors as unknown[]) : undefined;
}

/**
 * Maps any error to a safe JSON response. Upstream messages are forwarded for 4xx; 5xx and
 * unknown errors never leak internals. A 401 also clears the auth cookie (session is over).
 */
export function bffError(error: unknown): NextResponse {
  // Never swallow Next.js control-flow errors (prerender bailouts, redirect, notFound).
  unstable_rethrow(error);
  const apiError = toApiError(error);
  const status = apiError.status ?? 502;
  const message = status >= 500 ? "Upstream service error" : apiError.message;

  if (status >= 500 || apiError.status === null) console.error("[bff]", apiError);

  const headers: Record<string, string> = { ...NO_STORE };
  if (apiError.retryAfterSeconds) headers["Retry-After"] = String(apiError.retryAfterSeconds);

  // 4xx: the upstream `errors` (ProblemDetails: `{ code, message }`) too, so the browser can map error codes.
  const errors = status < 500 ? upstreamErrors(apiError.details) : undefined;
  const response = NextResponse.json(errors ? { message, errors } : { message }, {
    status,
    headers,
  });
  if (apiError.code === "UNAUTHORIZED") clearAuthCookies(response.cookies);
  return response;
}
