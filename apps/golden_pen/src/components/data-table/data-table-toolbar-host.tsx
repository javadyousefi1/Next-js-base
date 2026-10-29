"use client";

import { DataTableProvider } from "@repo/table/data-table-context";
import type { DataTableFilter, TableControls } from "@repo/table/types";

import { DataTableToolbar } from "./data-table-toolbar";

type DataTableToolbarHostProps = {
  /** URL state + actions only (`useTableState`): the toolbar needs no data. */
  controls: TableControls;
  filters: DataTableFilter[];
  searchPlaceholder: string;
  /** `false` for an API without text search. */
  search?: boolean;
};

/**
 * The toolbar on its own, outside the data's Suspense boundary: it is there (and usable) before
 * the rows arrive and is never remounted, so nothing appears late or loses what was typed.
 */
export function DataTableToolbarHost({
  controls,
  filters,
  searchPlaceholder,
  search,
}: DataTableToolbarHostProps) {
  const table = {
    ...controls,
    rows: [],
    total: 0,
    isLoading: false,
    isFetching: false,
    isError: false,
    retry: () => undefined,
  };

  return (
    <DataTableProvider
      table={table}
      columns={[]}
      filters={filters}
      searchPlaceholder={searchPlaceholder}
    >
      <DataTableToolbar search={search} />
    </DataTableProvider>
  );
}
