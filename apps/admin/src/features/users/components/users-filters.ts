"use client";

import type { DataTableFilter } from "@repo/table/types";
import { useTranslations } from "next-intl";

import { USER_ROLES } from "../schemas/user.schema";

/** Filters shown in the toolbar. Each `id` is a key of `usersSearchParams`. */
export function useUsersFilters(): DataTableFilter[] {
  const t = useTranslations("Users");

  return [
    {
      id: "role",
      title: t("roleFilter"),
      options: USER_ROLES.map((role) => ({ value: role, label: t(`roles.${role}`) })),
    },
  ];
}
