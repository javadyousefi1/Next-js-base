"use client";

import { useTranslations } from "next-intl";

import { USER_ROLES } from "@/features/users/schemas/user.schema";

import { useSessionRoles } from "./use-session-roles";

/** Options and handlers of the «نمایش به‌عنوان» switcher (`value: null` = the real role). */
export function useRoleSwitcher() {
  const t = useTranslations("ViewAs");
  const tRoles = useTranslations("Users.roles");
  const { isRealSuperAdmin, viewAs, setViewAs } = useSessionRoles();

  const items = [
    { value: null, label: t("real") },
    ...USER_ROLES.map((role) => ({ value: role, label: tRoles(role) })),
  ];

  return {
    visible: isRealSuperAdmin,
    items,
    value: viewAs,
    onChange: (value: string | null) => setViewAs(value),
    label: t("label"),
    hint: t("hint"),
  };
}
