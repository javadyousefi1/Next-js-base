import "server-only";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIES } from "@/config/auth";
import { env } from "@/env";
import type { SessionToken } from "@/features/auth/schemas/auth.schema";

type ResponseCookies = NextResponse["cookies"];

/**
 * `Secure` follows how the panel is served: browsers drop `Secure` cookies on plain http, so an
 * `http://` site (localhost, or a server reached by IP) gets a non-secure cookie and an `https://`
 * site a secure one. `AUTH_COOKIE_SECURE` overrides it.
 */
const secure = env.AUTH_COOKIE_SECURE ?? env.NEXT_PUBLIC_SITE_URL.startsWith("https://");

/** The token is only ever stored in an httpOnly cookie: JavaScript in the browser can't read it. */
const baseCookie = { httpOnly: true, secure, sameSite: "lax", path: "/" } as const;

/** Expire the cookie a bit before the token so we never send an already-expired token. */
const EXPIRY_MARGIN_SECONDS = 30;

export function setAuthCookies(responseCookies: ResponseCookies, token: SessionToken): void {
  const ttl = token.expiresInSeconds ?? env.AUTH_TOKEN_TTL_SECONDS;

  responseCookies.set(AUTH_COOKIES.accessToken, token.accessToken, {
    ...baseCookie,
    maxAge: Math.max(ttl - EXPIRY_MARGIN_SECONDS, EXPIRY_MARGIN_SECONDS),
  });
}

export function clearAuthCookies(responseCookies: ResponseCookies): void {
  responseCookies.delete(AUTH_COOKIES.accessToken);
}

/** Route handlers: read the token from the incoming request. */
export function readAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get(AUTH_COOKIES.accessToken)?.value;
}

/** Server Components: read the access token (dynamic — must render inside `<Suspense>`). */
export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(AUTH_COOKIES.accessToken)?.value;
}
