"use client";

import { useTranslations } from "next-intl";

import { useSessionRoles } from "./use-session-roles";

/** The header indicator while a role override is active. */
export function useViewAsBadge() {
  const t = useTranslations("ViewAs");
  const tRoles = useTranslations("Users.roles");
  const { viewAs, clearViewAs } = useSessionRoles();

  return {
    text: viewAs ? t("badge", { role: tRoles(viewAs) }) : null,
    resetLabel: t("reset"),
    clear: clearViewAs,
  };
}
