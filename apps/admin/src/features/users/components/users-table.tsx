"use client";

import { useTranslations } from "next-intl";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { useUsersTable } from "../hooks/use-users-table";
import { useUsersColumns } from "./users-columns";

export function UsersTable() {
  const t = useTranslations("Users");
  const { table, isLoading, isFetching, isError, retry } = useUsersTable(useUsersColumns());

  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar table={table} searchPlaceholder={t("searchPlaceholder")} />
      <DataTable
        table={table}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        onRetry={retry}
      />
      <DataTablePagination table={table} />
    </div>
  );
}
