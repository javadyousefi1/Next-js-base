"use client";

import { Button } from "@repo/ui/components/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@repo/ui/components/empty";
import { useTranslations } from "next-intl";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { QueryError } from "@/components/feedback/query-error";

import { useUsersTable } from "../hooks/use-users-table";
import { usersColumns } from "./users-columns";
import { UsersToolbar } from "./users-toolbar";

export function UsersTable() {
  const t = useTranslations("Users");
  const model = useUsersTable({ columns: usersColumns });

  return (
    <div className="flex flex-col gap-4">
      <UsersToolbar
        search={model.search}
        onSearchChange={model.setSearch}
        role={model.role}
        onRoleChange={model.setRole}
        hasFilters={model.hasFilters}
        onReset={model.resetFilters}
      />

      {model.status === "loading" && (
        <DataTableSkeleton columns={usersColumns.length} rows={model.pagination.pageSize} />
      )}
      {model.status === "error" && <QueryError onRetry={model.retry} />}
      {model.status === "ready" && (
        <DataTable
          table={model.table}
          isFetching={model.isFetching}
          empty={
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t("empty.title")}</EmptyTitle>
                <EmptyDescription>{t("empty.description")}</EmptyDescription>
              </EmptyHeader>
              {model.hasFilters ? (
                <EmptyContent>
                  <Button variant="outline" onClick={model.resetFilters}>
                    {t("resetFilters")}
                  </Button>
                </EmptyContent>
              ) : null}
            </Empty>
          }
        />
      )}

      <DataTablePagination pagination={model.pagination} />
    </div>
  );
}
