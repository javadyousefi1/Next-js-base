"use client";

import { useTranslations } from "next-intl";

import { identityStatusSchema } from "../schemas/user.schema";

/** Persian label of an identity status (see `IDENTITY_STATUSES`); an unknown one is shown as-is. */
export function useIdentityStatusLabel() {
  const t = useTranslations("Users");

  return (status: number) => {
    const key = identityStatusSchema.safeParse(String(status));
    return key.success ? t(`identityStatuses.${key.data}`) : String(status);
  };
}
