import { permissionsOf } from "@repo/access/access";
import { z } from "zod";

import { ACCESS_POLICY, PERMISSIONS } from "@/config/access";
import { userRoleSchema } from "@/features/users/schemas/user.schema";

import type { LoginInput, LoginResult, SessionUser, TokenPair } from "../schemas/auth.schema";

/**
 * The ONLY file that knows the backend's auth API: JWT access + refresh token (here
 * DummyJSON-style). A new backend → change this file (+ `API_ENDPOINTS`, the MSW mock), nothing
 * else. It is imported by the browser too (`meResponse`): no env and no secrets here — a backend
 * that needs a client secret for token calls gets it in `src/server/auth/upstream-auth.ts`.
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
const backendTokens = z.object(backendTokenShape);

/** Backend tokens (access lifetime in minutes) → the app's `TokenPair` (seconds). */
function toTokenPair({
  accessToken,
  refreshToken,
  expiresInMins,
}: z.output<typeof backendTokens>): TokenPair {
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
  // Missing or unknown role → "user" (least privilege) instead of failing the whole session.
  role: userRoleSchema.catch("user"),
};
const backendUser = z.object(backendUserShape);

/**
 * Backend user → the app's `SessionUser` (who they are and what they may do). This backend sends
 * one `role`; the permissions come from `ACCESS_POLICY`. A backend that sends a role list or its
 * own permissions maps them here and nowhere else.
 */
function toSessionUser({ role, ...user }: z.output<typeof backendUser>): SessionUser {
  return {
    ...user,
    roles: [role],
    permissions: permissionsOf(ACCESS_POLICY, [role], PERMISSIONS),
  };
}

/** The signed-in user (`/auth/me`). */
export const meResponse = backendUser.transform(toSessionUser);

/** Login response: user fields + tokens → `{ user, tokens }`. */
export const loginResponse = z
  .object({ ...backendUserShape, ...backendTokenShape })
  .transform(({ accessToken, refreshToken, expiresInMins, ...user }): LoginResult => ({
    user: toSessionUser(user),
    tokens: toTokenPair({ accessToken, refreshToken, expiresInMins }),
  }));

/** Refresh response: a new token pair. */
export const refreshResponse = backendTokens.transform(toTokenPair);
