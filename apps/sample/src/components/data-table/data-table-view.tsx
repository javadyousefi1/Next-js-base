"use client";

import { DataTableProvider } from "@repo/table/data-table-context";
import type { DataTableColumn, DataTableFilter, TableController } from "@repo/table/types";
import type { ReactNode } from "react";

import { DataTable } from "./data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

type DataTableViewProps<TRow extends { id: string | number }> = {
  table: TableController<TRow>;
  columns: DataTableColumn<TRow>[];
  filters?: DataTableFilter[];
  searchPlaceholder: string;
  /** Buttons at the end of the toolbar (create, refresh…). */
  actions?: ReactNode;
};

/**
 * A whole server-driven table: toolbar (search, filters, `actions`) + rows + pagination. A
 * feature only passes its controller, columns and filters:
 *
 *   <DataTableView table={useUsersTable()} columns={useUsersColumns()} filters={useUsersFilters()} />
 */
export function DataTableView<TRow extends { id: string | number }>({
  actions,
  ...context
}: DataTableViewProps<TRow>) {
  return (
    <DataTableProvider {...context}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <DataTableToolbar />
          </div>
          {actions ? <div className="flex gap-2">{actions}</div> : null}
        </div>
        <DataTable />
        <DataTablePagination />
      </div>
    </DataTableProvider>
  );
}
