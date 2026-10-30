/**
 * Single source of truth for every pathname in the app.
 *
 * Never hard-code a path in `<Link href>`, `router.push/replace`, `redirect()` or anywhere else —
 * import it from here. Enforced by the `project/no-hardcoded-routes` lint rule.
 * Paths are locale-agnostic: the i18n-aware `Link`/`useAppRouter`/`redirect` add the locale.
 */
export const ROUTES = {
  landing: "/",
  dashboard: "/dashboard",
  login: "/login",
  register: "/register",
  users: "/users",
  inviteLinks: "/invite-links",
  identityRequests: "/identity-requests",
  settings: "/settings",
  profile: "/profile",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];

/** Pages reachable without a session. Every other page is protected by `src/proxy.ts`. */
export const PUBLIC_ROUTES: readonly AppRoute[] = [ROUTES.landing, ROUTES.login, ROUTES.register];

/** Landing page after login, and where authenticated users are sent from public pages. */
export const DEFAULT_AUTHENTICATED_ROUTE: AppRoute = ROUTES.dashboard;

/** Query-string key used to return to the original page after login. */
export const CALLBACK_URL_PARAM = "callbackUrl";

/** Backend-for-frontend endpoints (Next.js route handlers). */
export const API_ROUTES = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    register: "/api/auth/register",
    otpSend: "/api/auth/otp/send",
    otpResend: "/api/auth/otp/resend",
    otpVerify: "/api/auth/otp/verify",
  },
  /** Multipart upload (avatar, identity documents): the generic proxy is JSON-only. */
  upload: "/api/upload",
  /** Catch-all proxy to the upstream API: `/api/proxy/<upstream path>`. */
  proxy: "/api/proxy",
  health: "/api/health",
} as const;

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/** Only same-app relative paths are accepted as a post-login destination (no open redirects). */
export function sanitizeCallbackUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return DEFAULT_AUTHENTICATED_ROUTE;
  }
  return value;
}
