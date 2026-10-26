import "server-only";
import { ApiError } from "@repo/http";
import type { NextRequest } from "next/server";

import { readAccessToken } from "./cookies";

/**
 * Runs an upstream call with the user's access token (read from the httpOnly cookie).
 * The backend has no refresh token: a missing token or an upstream 401 ends the session
 * (`bffError` clears the cookie on a 401).
 */
export async function withSession<T>(
  request: NextRequest,
  call: (accessToken: string) => Promise<T>,
): Promise<T> {
  const accessToken = readAccessToken(request);
  if (!accessToken) {
    throw new ApiError("Not authenticated", { status: 401, code: "UNAUTHORIZED" });
  }
  return call(accessToken);
}
