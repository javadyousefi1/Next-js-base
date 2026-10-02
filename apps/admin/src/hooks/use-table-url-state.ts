"use client";

import { useQueryStates } from "nuqs";

import { tableSearchParams, type SortOrder } from "@/lib/table/search-params";

import { useDebouncedValue } from "./use-debounced-value";

/** Shared nuqs options for table URL state: no history entry per keystroke, clean URLs. */
export const TABLE_URL_OPTIONS = { history: "replace", clearOnDefault: true } as const;

/**
 * Search + sorting + pagination state of a table, stored in the URL (shareable, survives
 * reloads, works with back/forward). Knows nothing about the API or the UI.
 * Table-specific filters live in the feature hook (`useQueryStates(featureFilters)`) and must
 * call `resetPage()` when they change.
 *
 * - `search` updates instantly (input value); `debouncedSearch` is what you send to the API.
 * - Any change except pagination resets the page to 1.
 */
export function useTableUrlState() {
  const [state, setState] = useQueryStates(tableSearchParams, TABLE_URL_OPTIONS);
  const debouncedSearch = useDebouncedValue(state.q, 300);

  return {
    state,
    search: state.q,
    debouncedSearch,
    // nuqs setters return a promise (URL flush); callers only need fire-and-forget.
    setSearch: (q: string) => void setState({ q, page: 1 }),
    setPage: (page: number) => void setState({ page }),
    resetPage: () => void setState({ page: 1 }),
    setPageSize: (pageSize: number) => void setState({ pageSize, page: 1 }),
    setSorting: (sortBy: string | null, order: SortOrder) =>
      void setState({ sortBy, order, page: 1 }),
    reset: () => void setState(null),
  };
}
