import type { ReactNode } from "react";

import type { SortOrder } from "./search-params";

/** URL state every table has (`tableSearchParams`). */
export type TableState = {
  page: number;
  pageSize: number;
  q: string;
  sortBy: string | null;
  order: SortOrder;
};

/** State + actions returned by `useTableState`. */
export type TableControls = {
  state: TableState;
  /** Current value of each filter (`{ role: "admin" }`), `null` = not filtered. */
  filters: Record<string, string | null>;
  hasFilters: boolean;
  setSearch: (q: string) => void;
  setFilter: (id: string, value: string | null) => void;
  toggleSort: (columnId: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  /** Clears the search and every filter (keeps sorting and page size). */
  resetFilters: () => void;
};

/** What the data-table components receive: the controls + the current page of data. */
export type TableController<TRow> = TableControls & {
  rows: TRow[];
  total: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  retry: () => void;
};

export type DataTableColumn<TRow> = {
  /** Also the sort key sent to the API (`?sortBy=age`). */
  id: string;
  header: string;
  cell: (row: TRow) => ReactNode;
  sortable?: boolean;
};

export type DataTableFilter = {
  /** URL key (`?role=admin`) — must exist in the feature's search params. */
  id: string;
  title: string;
  options: { value: string; label: string }[];
};
