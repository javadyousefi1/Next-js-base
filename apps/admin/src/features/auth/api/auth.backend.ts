import { z } from "zod";

import { userRoleSchema } from "@/features/users/schemas/user.schema";

import type { LoginInput, LoginResult, SessionUser, TokenPair } from "../schemas/auth.schema";

/**
 * The ONLY file that knows the backend's auth API: JWT access + refresh token (here
 * DummyJSON-style). A new backend → change this file (+ `API_ENDPOINTS`, the MSW mock), nothing
 * else. It is imported by the browser too (`meResponse`), so it must stay free of server-only code.
 */

/** Login credentials → the backend's login request body. */
export function toLoginBody(input: LoginInput) {
  return { username: input.username, password: input.password };
}

/** Refresh token → the backend's refresh request body. */
export function toRefreshBody(refreshToken: string) {
  return { refreshToken };
}

/** How the backend authenticates a request with an access token. */
export function authorizationHeader(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

const backendTokenShape = {
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresInMins: z.number().int().positive().optional(),
};

/** Backend tokens (access lifetime in minutes) → the app's `TokenPair` (seconds). */
function toTokenPair({
  accessToken,
  refreshToken,
  expiresInMins,
}: {
  accessToken: string;
  refreshToken: string;
  expiresInMins?: number;
}): TokenPair {
  return {
    accessToken,
    refreshToken,
    expiresInSeconds: expiresInMins ? expiresInMins * 60 : undefined,
  };
}

const backendUserShape = {
  id: z.number().int(),
  username: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  role: userRoleSchema.default("user"),
};

/** The signed-in user (`/auth/me`). */
export const meResponse: z.ZodType<SessionUser> = z.object(backendUserShape);

/** Login response: user fields + tokens → `{ user, tokens }`. */
export const loginResponse = z
  .object({ ...backendUserShape, ...backendTokenShape })
  .transform(({ accessToken, refreshToken, expiresInMins, ...user }): LoginResult => ({
    user,
    tokens: toTokenPair({ accessToken, refreshToken, expiresInMins }),
  }));

/** Refresh response: a new token pair. */
export const refreshResponse = z.object(backendTokenShape).transform(toTokenPair);
