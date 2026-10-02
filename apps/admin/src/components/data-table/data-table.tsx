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
import { FlexRender, type RowData } from "@tanstack/react-table";

import { QueryError } from "@/components/feedback/query-error";
import type { DataTableInstance } from "@/lib/table/use-data-table";

import { DataTableEmpty } from "./data-table-empty";
import { DataTableSkeleton } from "./data-table-skeleton";

type DataTableProps<TData extends RowData> = {
  table: DataTableInstance<TData>;
  /** First load (no data yet) → skeleton. */
  isLoading?: boolean;
  /** Refetching with the previous page still visible → rows are dimmed. */
  isFetching?: boolean;
  /** Failed with no data to show → error with a retry button. */
  isError?: boolean;
  onRetry?: () => void;
};

/** Renders the rows of a `useDataTable` table, plus its loading / error / empty states. */
export function DataTable<TData extends RowData>({
  table,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRetry,
}: DataTableProps<TData>) {
  const columnCount = table.getVisibleLeafColumns().length;

  if (isLoading) {
    return <DataTableSkeleton columns={columnCount} rows={table.state.pagination.pageSize} />;
  }
  if (isError) return <QueryError onRetry={() => onRetry?.()} />;

  const rows = table.getRowModel().rows;

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : <FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody
          aria-busy={isFetching}
          className={cn("transition-opacity", isFetching && "opacity-60")}
        >
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnCount}>
                <DataTableEmpty table={table} />
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
