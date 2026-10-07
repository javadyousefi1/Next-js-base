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

/**
 * Value of one filter: one option for `select` and `text`, several for `multiSelect`,
 * `null` = not filtered.
 */
export type FilterValue = string | readonly string[] | null;

/** State + actions returned by `useTableState`. */
export type TableControls = {
  state: TableState;
  /** Current value of each filter (`{ role: "admin" }`), `null` = not filtered. */
  filters: Record<string, FilterValue>;
  /** How many filters are set — the badge on the Filters button. The search box is not counted. */
  activeFilterCount: number;
  /** The search box or any filter is set. */
  hasFilters: boolean;
  setSearch: (q: string) => void;
  /** Sets one filter; `""` and `[]` clear it. */
  setFilter: (id: string, value: FilterValue) => void;
  /** multiSelect: adds the option when it is missing, removes it when it is present. */
  toggleFilterOption: (id: string, option: string) => void;
  toggleSort: (columnId: string) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  /** Clears the search and every filter (keeps sorting and page size). */
  resetFilters: () => void;
  /** Clears every filter but keeps the search (the Filters drawer). */
  clearFilters: () => void;
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

export type FilterOption = { value: string; label: string };

/**
 * One field of the Filters drawer. `id` is its URL key (`?role=admin`) and must exist in the
 * feature's search params, with the parser of the same `type` (see `filterParams`).
 */
export type DataTableFilter =
  | { type: "select"; id: string; title: string; options: readonly FilterOption[] }
  | { type: "multiSelect"; id: string; title: string; options: readonly FilterOption[] }
  | { type: "text"; id: string; title: string; placeholder?: string };
