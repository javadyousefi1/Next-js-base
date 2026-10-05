"use client";

import type { DataTableColumn } from "@repo/table/types";
import { Badge } from "@repo/ui/components/badge";
import { useTranslations } from "next-intl";

import type { User, UserRole } from "../schemas/user.schema";

const ROLE_BADGE_VARIANTS = {
  admin: "default",
  moderator: "secondary",
  user: "outline",
} as const satisfies Record<UserRole, "default" | "secondary" | "outline">;

/** Column ids are the API sort fields (`USER_SORT_FIELDS`). */
export function useUsersColumns(): DataTableColumn<User>[] {
  const t = useTranslations("Users");

  return [
    {
      id: "firstName",
      header: t("columns.name"),
      sortable: true,
      cell: (user) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {user.firstName} {user.lastName}
          </span>
          <span className="text-xs text-muted-foreground">@{user.username}</span>
        </div>
      ),
    },
    { id: "email", header: t("columns.email"), sortable: true, cell: (user) => user.email },
    {
      id: "role",
      header: t("columns.role"),
      sortable: true,
      cell: (user) => (
        <Badge variant={ROLE_BADGE_VARIANTS[user.role]}>{t(`roles.${user.role}`)}</Badge>
      ),
    },
    {
      id: "age",
      header: t("columns.age"),
      sortable: true,
      cell: (user) => <span className="tabular-nums">{user.age}</span>,
    },
    { id: "company", header: t("columns.company"), cell: (user) => user.company?.name ?? "—" },
  ];
}
