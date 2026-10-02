import "server-only";

import { NextResponse } from "next/server";

import type { TokenPair } from "@/features/auth/schemas/auth.schema";
import { toApiError } from "@/lib/http/errors";
import { clearAuthCookies, setAuthCookies } from "@/server/auth/cookies";

const NO_STORE = { "Cache-Control": "no-store" };

/** JSON response from a BFF route. Persists rotated tokens when the session was refreshed. */
export function bffJson(
  body: unknown,
  { status = 200, refreshedTokens }: { status?: number; refreshedTokens?: TokenPair } = {},
): NextResponse {
  const response = NextResponse.json(body, { status, headers: NO_STORE });
  if (refreshedTokens) setAuthCookies(response.cookies, refreshedTokens);
  return response;
}

/**
 * Maps any error to a safe JSON response. Upstream messages are forwarded for 4xx; 5xx and
 * unknown errors never leak internals. A 401 also clears the auth cookies (session is over).
 */
export function bffError(error: unknown): NextResponse {
  const apiError = toApiError(error);
  const status = apiError.status ?? 502;
  const message = status >= 500 ? "Upstream service error" : apiError.message;

  if (status >= 500 || apiError.status === null) console.error("[bff]", apiError);

  const headers: Record<string, string> = { ...NO_STORE };
  if (apiError.retryAfterSeconds) headers["Retry-After"] = String(apiError.retryAfterSeconds);

  const response = NextResponse.json({ message }, { status, headers });
  if (apiError.code === "UNAUTHORIZED") clearAuthCookies(response.cookies);
  return response;
}
