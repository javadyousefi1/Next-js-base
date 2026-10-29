"use client";

import type { ApiError } from "@repo/http";
import { useTranslations } from "next-intl";

import { serverMessage } from "@/features/profile/hooks/server-message";

import { identityErrorKind } from "../api/identity-requests.backend";

/** A failed identity request → Persian text: by error code, else the server's reason, else generic. */
export function useIdentityErrorMessage() {
  const t = useTranslations("IdentityRequests");

  return (error: ApiError) => {
    const kind = identityErrorKind(error);
    if (kind) return t(`errors.${kind}`);
    return serverMessage(error, t("errors.generic")) ?? t("errors.generic");
  };
}
