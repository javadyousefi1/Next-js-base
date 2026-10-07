"use client";

import { createContext, use, useMemo, type ReactNode } from "react";

import type { DataTableColumn, DataTableFilter, TableController } from "./types";

type Row = { id: string | number };

/** Everything the data-table components read: the table, its columns and its filters. */
export type DataTableContextValue<TRow extends Row = Row> = {
  table: TableController<TRow>;
  columns: DataTableColumn<TRow>[];
  filters: DataTableFilter[];
  searchPlaceholder: string;
};

type DataTableProviderProps<TRow extends Row> = Omit<DataTableContextValue<TRow>, "filters"> & {
  /** Fields of the Filters drawer; without any the Filters button is not shown. */
  filters?: DataTableFilter[];
  children: ReactNode;
};

const NO_FILTERS: DataTableFilter[] = [];

const DataTableContext = createContext<DataTableContextValue | null>(null);

/** Gives the data-table components (toolbar, table, pagination) the table to render. */
export function DataTableProvider<TRow extends Row>({
  children,
  filters = NO_FILTERS,
  table,
  columns,
  searchPlaceholder,
}: DataTableProviderProps<TRow>) {
  // The columns' `cell` takes the same TRow as the rows: the context keeps them as the base Row.
  // (`table` is a new object per render, so this mostly satisfies the lint rule; it is cheap.)
  const value = useMemo(
    () => ({ table, columns, filters, searchPlaceholder }) as unknown as DataTableContextValue,
    [table, columns, filters, searchPlaceholder],
  );

  return <DataTableContext value={value}>{children}</DataTableContext>;
}

/** The table of the closest `<DataTableProvider>`. */
export function useDataTable(): DataTableContextValue {
  const context = use(DataTableContext);
  if (!context) throw new Error("useDataTable() must be used inside <DataTableProvider>");
  return context;
}
