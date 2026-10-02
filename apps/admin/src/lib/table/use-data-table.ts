"use client";

import {
  functionalUpdate,
  useTable,
  type ColumnDef,
  type ReactTable,
  type RowData,
} from "@tanstack/react-table";

import { dataTableFeatures, type DataTableFeatures } from "./features";
import type { SortOrder } from "./search-params";

/** Table state as it lives in the URL (`tableSearchParams`) + one key per filter column. */
export type DataTableState = {
  page: number;
  pageSize: number;
  q: string;
  sortBy: string | null;
  order: SortOrder;
  [filterColumnId: string]: string | number | null;
};

/** What `useDataTable` returns and every data-table component receives. */
export type DataTableInstance<TData extends RowData> = ReactTable<DataTableFeatures, TData>;

const BASE_KEYS = new Set(["page", "pageSize", "q", "sortBy", "order"]);

type UseDataTableOptions<TData extends RowData, TState extends DataTableState> = {
  data: TData[];
  // oxlint-disable-next-line typescript/no-explicit-any -- TanStack's type for mixed column value types
  columns: ColumnDef<DataTableFeatures, TData, any>[];
  /** Total rows on the server (for the page count). */
  rowCount: number;
  getRowId?: (row: TData) => string;
  /** Controlled state, usually from `useQueryStates(featureSearchParams)`. */
  state: TState;
  /** Receives partial updates, usually nuqs' setter. */
  onStateChange: (patch: Partial<TState>) => unknown;
};

/**
 * TanStack Table for server-side data, controlled like an input (`state` + `onStateChange`):
 *
 *   page / pageSize ⇄ pagination      sortBy / order ⇄ sorting
 *   q               ⇄ global filter   any other key  ⇄ the column filter with that id
 *
 * Every change except paging goes back to page 1. It knows nothing about URLs, queries or
 * translations; the toolbar, table and pagination components read everything from `table`.
 */
export function useDataTable<TData extends RowData, TState extends DataTableState>({
  state,
  onStateChange,
  ...options
}: UseDataTableOptions<TData, TState>) {
  const update = (patch: Partial<DataTableState>) => void onStateChange(patch as Partial<TState>);
  const filterIds = Object.keys(state).filter((key) => !BASE_KEYS.has(key));

  const pagination = { pageIndex: state.page - 1, pageSize: state.pageSize };
  const sorting = state.sortBy ? [{ id: state.sortBy, desc: state.order === "desc" }] : [];
  const columnFilters = filterIds
    .filter((id) => state[id] !== null)
    .map((id) => ({ id, value: state[id] }));

  return useTable({
    ...options,
    features: dataTableFeatures,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: { pagination, sorting, columnFilters, globalFilter: state.q },
    onPaginationChange: (updater) => {
      const next = functionalUpdate(updater, pagination);
      update(
        next.pageSize === pagination.pageSize
          ? { page: next.pageIndex + 1 }
          : { pageSize: next.pageSize, page: 1 },
      );
    },
    onSortingChange: (updater) => {
      const [first] = functionalUpdate(updater, sorting);
      update({ sortBy: first?.id ?? null, order: first?.desc ? "desc" : "asc", page: 1 });
    },
    onColumnFiltersChange: (updater) => {
      const next = functionalUpdate(updater, columnFilters);
      const value = (id: string) => next.find((filter) => filter.id === id)?.value;
      const filters = Object.fromEntries(
        filterIds.map((id) => [id, typeof value(id) === "string" ? String(value(id)) : null]),
      );
      update({ ...filters, page: 1 });
    },
    onGlobalFilterChange: (updater) => {
      const next = functionalUpdate(updater, state.q);
      update({ q: typeof next === "string" ? next : "", page: 1 });
    },
  });
}

/** True when a search or any column filter is active. */
export function isTableFiltered<TData extends RowData>(table: DataTableInstance<TData>) {
  return table.state.globalFilter !== "" || table.state.columnFilters.length > 0;
}

/** Clears the search and every column filter (one URL update). */
export function resetTableFilters<TData extends RowData>(table: DataTableInstance<TData>) {
  table.resetGlobalFilter(true);
  table.resetColumnFilters(true);
}
