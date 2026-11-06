"use client";

import { DataTableProvider } from "@repo/table/data-table-context";
import type { DataTableColumn, DataTableFilter, TableController } from "@repo/table/types";
import type { ReactNode } from "react";

import { DataTable } from "./data-table";
import type { DataTableEmptyTexts } from "./data-table-empty";
import { DataTablePagination } from "./data-table-pagination";

type DataTableViewProps<TRow extends { id: string | number }> = DataTableEmptyTexts & {
  table: TableController<TRow>;
  columns: DataTableColumn<TRow>[];
  filters?: DataTableFilter[];
  searchPlaceholder: string;
  /** Rendered inside the table context (e.g. a review sheet that reads the table). */
  children?: ReactNode;
};

/**
 * A server-driven table: rows + pagination in one table context. The toolbar is NOT part of it:
 * the page renders it in its own Suspense (`DataTableToolbarHost`), so it never appears late.
 *
 *   <DataTableView table={useUsersTable()} columns={useUsersColumns()} filters={useUsersFilters()} />
 */
export function DataTableView<TRow extends { id: string | number }>({
  children,
  emptyTitle,
  emptyDescription,
  emptyAction,
  ...context
}: DataTableViewProps<TRow>) {
  return (
    <DataTableProvider {...context}>
      <div className="flex flex-col gap-4">
        <DataTable
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          emptyAction={emptyAction}
        />
        <DataTablePagination />
      </div>
      {children}
    </DataTableProvider>
  );
}
