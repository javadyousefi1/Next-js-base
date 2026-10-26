import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIES } from "@/config/auth";
import {
  CALLBACK_URL_PARAM,
  DEFAULT_AUTHENTICATED_ROUTE,
  isPublicRoute,
  ROUTES,
} from "@/config/routes";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

/**
 * Runs before every page request (Next.js 16 `proxy`, formerly `middleware`):
 * 1. i18n routing via next-intl (one language, no URL prefix: rewrites to `/[locale]` internally)
 * 2. route guard: pages need the auth cookie; `/login` and `/register` are skipped when already
 *    signed in.
 *    This is an optimistic check only — the BFF validates the token on every API call.
 */
export function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);
  if (response.headers.has("location")) return response; // next-intl redirect (e.g. "/fa/login" → "/login")

  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIES.accessToken);

  if (!hasSession && !isPublicRoute(pathname)) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set(CALLBACK_URL_PARAM, `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && (pathname === ROUTES.login || pathname === ROUTES.register)) {
    return NextResponse.redirect(new URL(DEFAULT_AUTHENTICATED_ROUTE, request.url));
  }

  return response;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension (icons…).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
