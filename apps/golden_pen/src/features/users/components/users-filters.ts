"use client";

import type { DataTableFilter } from "@repo/table/types";
import { useTranslations } from "next-intl";

import { IDENTITY_STATUSES, USER_ROLES } from "../schemas/user.schema";

/** Fields of the Filters drawer. Each `id` is a key of `usersSearchParams`. */
export function useUsersFilters(): DataTableFilter[] {
  const t = useTranslations("Users");

  return [
    {
      type: "text",
      id: "phoneNumber",
      title: t("phoneNumberFilter"),
      placeholder: t("phoneNumberPlaceholder"),
    },
    {
      type: "select",
      id: "role",
      title: t("roleFilter"),
      options: USER_ROLES.map((role) => ({ value: role, label: t(`roles.${role}`) })),
    },
    {
      type: "select",
      id: "identityStatus",
      title: t("identityStatusFilter"),
      options: IDENTITY_STATUSES.map((status) => ({
        value: status,
        label: t(`identityStatuses.${status}`),
      })),
    },
  ];
}
