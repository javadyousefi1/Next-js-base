/**
 * Auth constants shared by `proxy.ts` (route guard) and the server modules.
 * Plain module on purpose: `proxy.ts` must not import `server-only` code.
 */
export const AUTH_COOKIES = {
  /** httpOnly; expires slightly before the upstream access token. */
  accessToken: "access_token",
  /** httpOnly; used by the BFF to rotate the access token. */
  refreshToken: "refresh_token",
} as const;

export const LOGIN_RATE_LIMIT = {
  /** Max login attempts per IP per window. */
  limit: 5,
  windowSeconds: 60,
} as const;
