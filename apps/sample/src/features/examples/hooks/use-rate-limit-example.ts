"use client";

import type { RateLimitResult } from "@repo/redis";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { useAppRouter } from "@/hooks/use-app-router";

import { pressRateLimitedButton } from "../server/redis.actions";

/** Calls the rate-limited Server Action and describes its last answer. */
export function useRateLimitExample() {
  const t = useTranslations("Examples.redis.rateLimit");
  const router = useAppRouter();
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RateLimitResult & { connected: boolean }>();

  const message = !result
    ? undefined
    : !result.connected
      ? t("failOpen")
      : result.allowed
        ? t("allowed", { remaining: result.remaining })
        : t("blocked", { seconds: result.retryAfterSeconds });

  return {
    isPending,
    message,
    blocked: result?.allowed === false,
    press: () =>
      startTransition(async () => {
        setResult(await pressRateLimitedButton());
      }),
    /** Re-renders the Server Components (the cached value) without a full reload. */
    reload: () => router.refresh(),
  };
}
