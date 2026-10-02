"use client";

import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table";

import { dataTableFeatures, type DataTableFeatures } from "./features";
import type { SortOrder } from "./search-params";

type UseDataTableOptions<TData extends RowData> = {
  data: TData[];
  // oxlint-disable-next-line typescript/no-explicit-any -- TanStack's type for mixed column value types
  columns: ColumnDef<DataTableFeatures, TData, any>[];
  /** Total rows on the server (for page count). */
  rowCount: number;
  page: number;
  pageSize: number;
  sortBy: string | null;
  order: SortOrder;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortingChange: (sortBy: string | null, order: SortOrder) => void;
  getRowId?: (row: TData) => string;
};

/**
 * Binds TanStack Table to externally controlled (URL) state. Pagination and sorting are
 * "manual": the table only renders what the server returned and reports user intents.
 */
export function useDataTable<TData extends RowData>(options: UseDataTableOptions<TData>) {
  const pagination = { pageIndex: options.page - 1, pageSize: options.pageSize };
  const sorting = options.sortBy ? [{ id: options.sortBy, desc: options.order === "desc" }] : [];

  const table = useTable({
    features: dataTableFeatures,
    data: options.data,
    columns: options.columns,
    getRowId: options.getRowId,
    rowCount: options.rowCount,
    manualPagination: true,
    manualSorting: true,
    state: { pagination, sorting },
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(pagination) : updater;
      if (next.pageSize !== pagination.pageSize) options.onPageSizeChange(next.pageSize);
      else options.onPageChange(next.pageIndex + 1);
    },
    onSortingChange: (updater) => {
      const [first] = typeof updater === "function" ? updater(sorting) : updater;
      options.onSortingChange(first?.id ?? null, first?.desc ? "desc" : "asc");
    },
  });

  const pageCount = Math.max(1, Math.ceil(options.rowCount / options.pageSize));

  return {
    table,
    pagination: {
      page: options.page,
      pageSize: options.pageSize,
      pageCount,
      rowCount: options.rowCount,
      canPrevious: options.page > 1,
      canNext: options.page < pageCount,
      goTo: (page: number) => options.onPageChange(Math.min(Math.max(page, 1), pageCount)),
      setPageSize: options.onPageSizeChange,
    },
  };
}

export type DataTablePagination = ReturnType<typeof useDataTable>["pagination"];
