/**
 * Auth constants shared by `proxy.ts` (route guard) and the server modules.
 * Plain module on purpose: `proxy.ts` must not import `server-only` code.
 */
export const AUTH_COOKIES = {
  /** httpOnly; expires slightly before the backend's JWT (there is no refresh token). */
  accessToken: "access_token",
} as const;

/** Seconds before "Resend code" is available again. */
export const OTP_RESEND_SECONDS = 60;
