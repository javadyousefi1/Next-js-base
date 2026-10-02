import type { RowData, Table } from "@tanstack/react-table";

import type { DataTableFeatures } from "./features";
import type { DataTablePagination } from "./use-data-table";

/** Labels a feature provides for its table (translations stay in the feature). */
export type DataTableLabels<TFilters extends Record<string, readonly string[]>> = {
  searchPlaceholder: string;
  filters: {
    [K in keyof TFilters]: { title: string; option: (value: TFilters[K][number]) => string };
  };
};

export type DataTableFilterModel = {
  id: string;
  title: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string | null) => void;
};

/** Everything `<DataTableToolbar>` renders. */
export type DataTableToolbarModel = {
  search: string;
  searchPlaceholder: string;
  onSearchChange: (value: string) => void;
  filters: DataTableFilterModel[];
  hasFilters: boolean;
  onReset: () => void;
};

/** Everything `<DataTableView>` renders — returned by `useQueryTable`. */
export type DataTableModel<TRow extends RowData> = {
  table: Table<DataTableFeatures, TRow>;
  pagination: DataTablePagination;
  toolbar: DataTableToolbarModel;
  /** `loading` only before the first page; later pages keep the previous rows visible. */
  status: "loading" | "error" | "ready";
  isFetching: boolean;
  retry: () => void;
};
