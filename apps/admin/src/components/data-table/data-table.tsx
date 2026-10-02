"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/utils";

import { QueryError } from "@/components/feedback/query-error";
import type { DataTableColumn, TableController } from "@/lib/table/types";

import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableEmpty } from "./data-table-empty";
import { DataTableSkeleton } from "./data-table-skeleton";

type DataTableProps<TRow extends { id: string | number }> = {
  table: TableController<TRow>;
  columns: DataTableColumn<TRow>[];
};

/** Rows of a server-driven table, with its loading / error / empty states and sortable headers. */
export function DataTable<TRow extends { id: string | number }>({
  table,
  columns,
}: DataTableProps<TRow>) {
  if (table.isLoading) {
    return <DataTableSkeleton columns={columns.length} rows={table.state.pageSize} />;
  }
  if (table.isError) return <QueryError onRetry={table.retry} />;

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id}>
                {column.sortable ? (
                  <DataTableColumnHeader
                    title={column.header}
                    direction={table.state.sortBy === column.id ? table.state.order : null}
                    onSort={() => table.toggleSort(column.id)}
                  />
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody
          aria-busy={table.isFetching}
          className={cn("transition-opacity", table.isFetching && "opacity-60")}
        >
          {table.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <DataTableEmpty hasFilters={table.hasFilters} onReset={table.resetFilters} />
              </TableCell>
            </TableRow>
          ) : (
            table.rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.id}>{column.cell(row)}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
