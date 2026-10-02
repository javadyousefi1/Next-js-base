import "server-only";

import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIES } from "@/config/auth";
import { isSecureCookie, serverEnv } from "@/env/server";
import type { TokenPair } from "@/features/auth/schemas/auth.schema";

type ResponseCookies = NextResponse["cookies"];

/** Tokens are only ever stored in httpOnly cookies: JavaScript in the browser can't read them. */
const baseCookie = { httpOnly: true, secure: isSecureCookie, sameSite: "lax", path: "/" } as const;

/** Expire the cookie a bit before the token so we never send an already-expired token. */
const EXPIRY_MARGIN_SECONDS = 30;

export function setAuthCookies(responseCookies: ResponseCookies, tokens: TokenPair): void {
  const accessTtl = tokens.expiresInMins
    ? tokens.expiresInMins * 60
    : serverEnv.AUTH_ACCESS_TOKEN_TTL_SECONDS;

  responseCookies.set(AUTH_COOKIES.accessToken, tokens.accessToken, {
    ...baseCookie,
    maxAge: Math.max(accessTtl - EXPIRY_MARGIN_SECONDS, EXPIRY_MARGIN_SECONDS),
  });
  responseCookies.set(AUTH_COOKIES.refreshToken, tokens.refreshToken, {
    ...baseCookie,
    maxAge: serverEnv.AUTH_REFRESH_TOKEN_TTL_SECONDS,
  });
}

export function clearAuthCookies(responseCookies: ResponseCookies): void {
  responseCookies.delete(AUTH_COOKIES.accessToken);
  responseCookies.delete(AUTH_COOKIES.refreshToken);
}

/** Route handlers: read tokens from the incoming request. */
export function readAuthCookies(request: NextRequest) {
  return {
    accessToken: request.cookies.get(AUTH_COOKIES.accessToken)?.value,
    refreshToken: request.cookies.get(AUTH_COOKIES.refreshToken)?.value,
  };
}

/** Server Components: read the access token (dynamic — must render inside `<Suspense>`). */
export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(AUTH_COOKIES.accessToken)?.value;
}
