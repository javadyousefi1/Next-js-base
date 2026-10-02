"use client";

import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
  type ParserMap,
  type Values,
} from "nuqs";

import { useDebouncedValue } from "./use-debounced-value";

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

const tableParsers = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(10),
  q: parseAsString.withDefault(""),
  sortBy: parseAsString,
  order: parseAsStringLiteral(SORT_ORDERS).withDefault("asc"),
};

/**
 * Search + filters + sorting + pagination state of a table, stored in the URL (shareable,
 * survives reloads, works with back/forward). Knows nothing about the API or the UI.
 *
 * - `search` updates instantly (input value); `debouncedSearch` is what you send to the API.
 * - Any change except pagination resets the page to 1.
 *
 * @param filters nuqs parsers for the table-specific filters, e.g. `{ role: parseAsStringLiteral(ROLES) }`
 */
export function useTableUrlState<TFilters extends ParserMap>(filters: TFilters) {
  const [state, setState] = useQueryStates(
    { ...tableParsers, ...filters },
    { history: "replace", clearOnDefault: true },
  );
  const debouncedSearch = useDebouncedValue(state.q, 300);

  return {
    state,
    search: state.q,
    debouncedSearch,
    setSearch: (q: string) => setState({ q, page: 1 }),
    setFilters: (values: Partial<Values<TFilters>>) => setState({ ...values, page: 1 }),
    setPage: (page: number) => setState({ page }),
    setPageSize: (pageSize: number) => setState({ pageSize, page: 1 }),
    setSorting: (sortBy: string | null, order: SortOrder) => setState({ sortBy, order, page: 1 }),
    reset: () => setState(null),
  };
}
