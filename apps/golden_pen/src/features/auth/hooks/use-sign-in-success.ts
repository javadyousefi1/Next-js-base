"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useQueryState } from "nuqs";

import { CALLBACK_URL_PARAM, sanitizeCallbackUrl } from "@/config/routes";
import { useAppRouter } from "@/hooks/use-app-router";

import { sessionQuery } from "../api/auth.queries";
import type { SessionResponse } from "../schemas/auth.schema";

/** After any sign-in (password, OTP, register): fill the session cache, go to `?callbackUrl=`. */
export function useSignInSuccess() {
  const router = useAppRouter();
  const queryClient = useQueryClient();
  const [callbackUrl] = useQueryState(CALLBACK_URL_PARAM);

  return ({ user }: SessionResponse) => {
    sessionQuery.setData(queryClient, undefined, () => user);
    router.replace(sanitizeCallbackUrl(callbackUrl));
  };
}
