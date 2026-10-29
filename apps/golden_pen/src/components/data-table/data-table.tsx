"use client";

import { useDataTable } from "@repo/table/data-table-context";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import { cn } from "@repo/ui/lib/utils";

import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableEmpty, type DataTableEmptyTexts } from "./data-table-empty";
import { DataTableError } from "./data-table-error";
import { BODY_ROW_CLASS, HEADER_ROW_CLASS, bodyHeight, tableMinHeight } from "./data-table-layout";
import { DataTableSkeleton } from "./data-table-skeleton";

/**
 * Rows of a server-driven table, with its loading / error / empty states and sortable headers.
 * The header and the body's height are the same in every state (see `data-table-layout.ts`).
 */
export function DataTable(emptyTexts: DataTableEmptyTexts) {
  const { table, columns } = useDataTable();
  const rows = table.state.pageSize;

  return (
    <div className="overflow-hidden rounded-lg border" style={{ minHeight: tableMinHeight(rows) }}>
      <Table>
        <TableHeader>
          <TableRow className={HEADER_ROW_CLASS}>
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
        {table.isLoading ? (
          <DataTableSkeleton columns={columns.length} rows={rows} />
        ) : (
          <TableBody
            aria-busy={table.isFetching}
            className={cn("transition-opacity", table.isFetching && "opacity-60")}
          >
            {table.isError || table.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <div style={{ height: bodyHeight(rows) }}>
                    {table.isError ? (
                      <DataTableError onRetry={table.retry} />
                    ) : (
                      <DataTableEmpty
                        hasFilters={table.hasFilters}
                        onReset={table.resetFilters}
                        {...emptyTexts}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.rows.map((row) => (
                <TableRow key={row.id} className={BODY_ROW_CLASS}>
                  {columns.map((column) => (
                    <TableCell key={column.id} className="max-w-xs truncate">
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        )}
      </Table>
    </div>
  );
}
