"use client";

import { Badge } from "@repo/ui/components/badge";
import { createColumnHelper, type CellData, type Column } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import type { DataTableFeatures } from "@/lib/table/features";

import type { User, UserRole } from "../schemas/user.schema";

type ColumnTitleKey = "name" | "email" | "role" | "age" | "company";

function ColumnTitle<TValue extends CellData>(props: {
  column: Column<DataTableFeatures, User, TValue>;
  titleKey: ColumnTitleKey;
}) {
  const t = useTranslations("Users.columns");
  return <DataTableColumnHeader column={props.column} title={t(props.titleKey)} />;
}

const ROLE_BADGE_VARIANTS = {
  admin: "default",
  moderator: "secondary",
  user: "outline",
} as const satisfies Record<UserRole, "default" | "secondary" | "outline">;

function RoleBadge({ role }: { role: UserRole }) {
  const t = useTranslations("Users.roles");
  return <Badge variant={ROLE_BADGE_VARIANTS[role]}>{t(role)}</Badge>;
}

const columnHelper = createColumnHelper<DataTableFeatures, User>();

/** Static column definitions (ids match `USER_SORT_FIELDS`, so sorting maps 1:1 to the API). */
export const usersColumns = columnHelper.columns([
  columnHelper.accessor("firstName", {
    header: ({ column }) => <ColumnTitle column={column} titleKey="name" />,
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
    header: ({ column }) => <ColumnTitle column={column} titleKey="email" />,
  }),
  columnHelper.accessor("role", {
    header: ({ column }) => <ColumnTitle column={column} titleKey="role" />,
    cell: ({ getValue }) => <RoleBadge role={getValue()} />,
  }),
  columnHelper.accessor("age", {
    header: ({ column }) => <ColumnTitle column={column} titleKey="age" />,
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
  columnHelper.accessor((user) => user.company?.name ?? "—", {
    id: "company",
    enableSorting: false,
    header: ({ column }) => <ColumnTitle column={column} titleKey="company" />,
  }),
]);
