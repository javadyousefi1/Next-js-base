"use client";

import { useQueryState } from "nuqs";

import { CALLBACK_URL_PARAM, sanitizeCallbackUrl } from "@/config/routes";
import { useAppRouter } from "@/hooks/use-app-router";

/**
 * After any sign-in (password, OTP, register): go to `?callbackUrl=`. The sign-in mutations
 * (`auth.api.ts`) have already stored the session.
 */
export function useSignInSuccess() {
  const router = useAppRouter();
  const [callbackUrl] = useQueryState(CALLBACK_URL_PARAM);

  return () => router.replace(sanitizeCallbackUrl(callbackUrl));
}
