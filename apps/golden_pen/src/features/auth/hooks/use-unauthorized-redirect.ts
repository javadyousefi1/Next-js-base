"use client";

import { useLatest } from "@repo/hooks/use-latest";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

import { CALLBACK_URL_PARAM, ROUTES } from "@/config/routes";
import { useAppRouter } from "@/hooks/use-app-router";
import { usePathname } from "@/i18n/navigation";
import { onUnauthorized } from "@/lib/http/auth-events";

/**
 * When any request returns 401 (the BFF cleared the auth cookie: the session is
 * over), drop the cached data and send the user to the login page, coming back
 * to the current page afterwards. Mounted once in the authenticated shell.
 */
export function useUnauthorizedRedirect() {
  const t = useTranslations("Common.error");
  const router = useAppRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const latest = useLatest({ router, pathname, message: t("unauthorized") });

  useEffect(
    () =>
      onUnauthorized(() => {
        const current = latest.current;
        queryClient.clear();
        toast.info(current.message, { id: "session-expired" });
        current.router.replace({
          pathname: ROUTES.login,
          query: { [CALLBACK_URL_PARAM]: current.pathname },
        });
      }),
    [latest, queryClient],
  );
}
