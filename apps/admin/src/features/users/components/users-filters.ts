"use client";

import { useTranslations } from "next-intl";

import type { DataTableFilter } from "@/lib/table/types";

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
