"use client";

import type { ApiError } from "@repo/http";
import { setErrorReporter } from "@repo/query";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

const NETWORK_CODES = new Set<ApiError["code"]>(["NETWORK", "TIMEOUT"]);

/**
 * Shows a toast for background query failures and non-silent mutation failures.
 * `UNAUTHORIZED` is skipped: `useUnauthorizedRedirect` sends the user to the login page.
 */
export function useQueryErrorToasts() {
  const t = useTranslations("Common.error");

  useEffect(
    () =>
      setErrorReporter((error) => {
        if (error.code === "UNAUTHORIZED") return;
        toast.error(NETWORK_CODES.has(error.code) ? t("network") : t("description"));
      }),
    [t],
  );
}
