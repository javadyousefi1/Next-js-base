"use client";

import { Badge } from "@repo/ui/components/badge";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableFeatures } from "@/lib/table/features";

import { USER_ROLES, type User, type UserRole } from "../schemas/user.schema";

const ROLE_BADGE_VARIANTS = {
  admin: "default",
  moderator: "secondary",
  user: "outline",
} as const satisfies Record<UserRole, "default" | "secondary" | "outline">;

const columnHelper = createColumnHelper<DataTableFeatures, User>();

/**
 * Users table columns. Column ids match the API sort fields; `meta.filter` makes the toolbar
 * render a filter for the column (its id is the URL key: `?role=admin`).
 */
export function useUsersColumns() {
  const t = useTranslations("Users");

  return columnHelper.columns([
    columnHelper.accessor("firstName", {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.name")} />,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
          <span className="text-xs text-muted-foreground">@{row.original.username}</span>
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.email")} />,
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.role")} />,
      cell: ({ getValue }) => (
        <Badge variant={ROLE_BADGE_VARIANTS[getValue()]}>{t(`roles.${getValue()}`)}</Badge>
      ),
      meta: {
        filter: {
          title: t("roleFilter"),
          options: USER_ROLES.map((role) => ({ value: role, label: t(`roles.${role}`) })),
        },
      },
    }),
    columnHelper.accessor("age", {
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("columns.age")} />,
      cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
    }),
    columnHelper.accessor((user) => user.company?.name ?? "—", {
      id: "company",
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("columns.company")} />
      ),
    }),
  ]);
}
