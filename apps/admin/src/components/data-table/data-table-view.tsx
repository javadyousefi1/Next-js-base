"use client";

import type { RowData } from "@tanstack/react-table";

import { QueryError } from "@/components/feedback/query-error";
import type { DataTableModel } from "@/lib/table/types";

import { DataTable } from "./data-table";
import { DataTableEmpty } from "./data-table-empty";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DataTableToolbar } from "./data-table-toolbar";

type DataTableViewProps<TRow extends RowData> = {
  model: DataTableModel<TRow>;
};

/** A complete table screen (toolbar, loading/error/empty states, rows, pagination). */
export function DataTableView<TRow extends RowData>({ model }: DataTableViewProps<TRow>) {
  return (
    <div className="flex flex-col gap-4">
      <DataTableToolbar {...model.toolbar} />

      {model.status === "loading" && (
        <DataTableSkeleton
          columns={model.table.getVisibleLeafColumns().length}
          rows={model.pagination.pageSize}
        />
      )}
      {model.status === "error" && <QueryError onRetry={model.retry} />}
      {model.status === "ready" && (
        <DataTable
          table={model.table}
          isFetching={model.isFetching}
          empty={
            <DataTableEmpty hasFilters={model.toolbar.hasFilters} onReset={model.toolbar.onReset} />
          }
        />
      )}

      <DataTablePagination pagination={model.pagination} />
    </div>
  );
}
