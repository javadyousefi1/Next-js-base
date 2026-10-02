"use client";

import { useTranslations } from "next-intl";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { useUsersTable } from "../hooks/use-users-table";
import { useUsersColumns } from "./users-columns";
import { useUsersFilters } from "./users-filters";

export function UsersTable() {
  const t = useTranslations("Users");
  const table = useUsersTable();
  const columns = useUsersColumns();
  const filters = useUsersFilters();

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar
        table={table}
        filters={filters}
        searchPlaceholder={t("searchPlaceholder")}
      />
      <DataTable table={table} columns={columns} />
      <DataTablePagination table={table} />
    </div>
  );
}
