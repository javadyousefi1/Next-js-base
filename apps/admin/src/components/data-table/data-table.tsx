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
import { FlexRender, type RowData, type Table as TableModel } from "@tanstack/react-table";
import type { ReactNode } from "react";

import type { DataTableFeatures } from "@/lib/table/features";

type DataTableProps<TData extends RowData> = {
  table: TableModel<DataTableFeatures, TData>;
  /** Rendered in place of the rows when the current page is empty. */
  empty: ReactNode;
  /** Dims the rows while the next page loads (the previous page stays visible). */
  isFetching?: boolean;
};

/** Presentational table: renders the model built by `useDataTable`. No state, no fetching. */
export function DataTable<TData extends RowData>({
  table,
  empty,
  isFetching = false,
}: DataTableProps<TData>) {
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
              <TableCell colSpan={table.getVisibleLeafColumns().length}>{empty}</TableCell>
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
