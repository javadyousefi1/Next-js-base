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

/** `/fa/users` → `{ locale: "fa", pathname: "/users" }` */
function splitLocale(pathname: string) {
  const [, maybeLocale = "", ...rest] = pathname.split("/");
  const locale = routing.locales.find((candidate) => candidate === maybeLocale);
  return locale
    ? { locale, pathname: `/${rest.join("/")}` }
    : { locale: routing.defaultLocale, pathname };
}

function localized(locale: string, pathname: string, request: NextRequest) {
  return new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url);
}

/**
 * Runs before every page request (Next.js 16 `proxy`, formerly `middleware`):
 * 1. i18n routing (locale prefix, cookie, hreflang `Link` header) via next-intl
 * 2. route guard: pages need an auth cookie; `/login` is skipped when already signed in.
 *    This is an optimistic check only — the BFF validates the token on every API call.
 */
export function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);
  if (response.headers.has("location")) return response; // next-intl redirect (e.g. "/" → "/en")

  const { locale, pathname } = splitLocale(request.nextUrl.pathname);
  const hasSession =
    request.cookies.has(AUTH_COOKIES.accessToken) || request.cookies.has(AUTH_COOKIES.refreshToken);

  if (!hasSession && !isPublicRoute(pathname)) {
    const loginUrl = localized(locale, ROUTES.login, request);
    loginUrl.searchParams.set(CALLBACK_URL_PARAM, `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && pathname === ROUTES.login) {
    return NextResponse.redirect(localized(locale, DEFAULT_AUTHENTICATED_ROUTE, request));
  }

  return response;
}

export const config = {
  // Everything except API routes, Next internals and files with an extension (icons, sw.js…).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
