import "server-only";
import type { NextRequest } from "next/server";

import type { TokenPair } from "@/features/auth/schemas/auth.schema";
import { ApiError, isApiError } from "@/lib/http/errors";

import { readAuthCookies } from "./cookies";
import { upstreamRefresh } from "./upstream-auth";

export type SessionCall<T> = { result: T; refreshedTokens?: TokenPair };

const unauthorized = () => new ApiError("Not authenticated", { status: 401, code: "UNAUTHORIZED" });

/**
 * Runs an upstream call with the user's access token (read from the httpOnly cookie).
 * If the token is missing/expired it refreshes ONCE with the refresh token and retries.
 * The caller must persist `refreshedTokens` on its response (`setAuthCookies`).
 */
export async function withSession<T>(
  request: NextRequest,
  call: (accessToken: string) => Promise<T>,
): Promise<SessionCall<T>> {
  const { accessToken, refreshToken } = readAuthCookies(request);

  if (accessToken) {
    try {
      return { result: await call(accessToken) };
    } catch (error) {
      if (!isApiError(error) || error.code !== "UNAUTHORIZED" || !refreshToken) throw error;
    }
  }

  if (!refreshToken) throw unauthorized();

  const refreshedTokens = await upstreamRefresh(refreshToken).catch(() => {
    throw unauthorized();
  });
  return { result: await call(refreshedTokens.accessToken), refreshedTokens };
}
