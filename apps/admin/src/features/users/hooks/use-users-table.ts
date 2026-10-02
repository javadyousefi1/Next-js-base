"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import type { DataTableFeatures } from "@/lib/table/features";
import { useQueryTable } from "@/lib/table/use-query-table";

import { usersListQuery } from "../api/users.queries";
import type { User } from "../schemas/user.schema";
import { usersTable } from "../users.table";

// oxlint-disable-next-line typescript/no-explicit-any -- TanStack's type for mixed column value types
type UsersColumns = ColumnDef<DataTableFeatures, User, any>[];

/** Users table = generic query table + this feature's query, columns and labels. */
export function useUsersTable(columns: UsersColumns) {
  const t = useTranslations("Users");

  return useQueryTable({
    definition: usersTable,
    query: usersListQuery,
    select: (data) => ({ rows: data.users, total: data.total }),
    columns,
    getRowId: (user) => String(user.id),
    labels: {
      searchPlaceholder: t("searchPlaceholder"),
      filters: { role: { title: t("roleFilter"), option: (role) => t(`roles.${role}`) } },
    },
  });
}
