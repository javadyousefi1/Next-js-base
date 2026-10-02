"use client";

import { useQueryStates } from "nuqs";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

import type { DataTableDefinition, DataTableParams } from "./define-data-table";
import type { SortOrder } from "./search-params";
import type { DataTableLabels, DataTableToolbarModel } from "./types";

/** No history entry per keystroke; default values are removed from the URL. */
const URL_OPTIONS = { history: "replace", clearOnDefault: true } as const;

type UrlValue = string | number | null;
type UrlState = {
  q: string;
  page: number;
  pageSize: number;
  sortBy: string | null;
  order: SortOrder;
};
type FilterLabel = { title: string; option: (value: string) => string };

/**
 * URL state of a table built from its definition: search (debounced for the API), filters,
 * sorting, pagination. Every change except pagination resets the page to 1.
 * Returns the query params, the `useDataTable` binding and the toolbar model.
 */
export function useDataTableState<TDefinition extends DataTableDefinition>(
  definition: TDefinition,
  labels: DataTableLabels<TDefinition["filters"]>,
) {
  const [urlState, setUrlState] = useQueryStates(definition.parsers, URL_OPTIONS);
  // Generic internals: the definition's concrete types are restored in the return value.
  const state = urlState as UrlState & Record<string, UrlValue>;
  const update = (values: Record<string, UrlValue> | null) =>
    void (setUrlState as (values: Record<string, UrlValue> | null) => Promise<unknown>)(values);
  const filterLabels = labels.filters as Record<string, FilterLabel>;
  const filterIds = Object.keys(definition.filters);
  const debouncedSearch = useDebouncedValue(state.q, 300);

  const toolbar: DataTableToolbarModel = {
    search: state.q,
    searchPlaceholder: labels.searchPlaceholder,
    onSearchChange: (q) => update({ q, page: 1 }),
    filters: filterIds.map((id) => ({
      id,
      title: filterLabels[id]?.title ?? id,
      value: state[id] === null ? null : String(state[id]),
      options: (definition.filters[id] ?? []).map((value) => ({
        value,
        label: filterLabels[id]?.option(value) ?? value,
      })),
      onChange: (value) => update({ [id]: value, page: 1 }),
    })),
    hasFilters: state.q !== "" || filterIds.some((id) => state[id] !== null),
    onReset: () => update(null),
  };

  return {
    params: { ...urlState, q: debouncedSearch } as DataTableParams<TDefinition>,
    binding: {
      page: state.page,
      pageSize: state.pageSize,
      sortBy: state.sortBy,
      order: state.order,
      onPageChange: (page: number) => update({ page }),
      onPageSizeChange: (pageSize: number) => update({ pageSize, page: 1 }),
      onSortingChange: (sortBy: string | null, order: SortOrder) =>
        update({ sortBy, order, page: 1 }),
    },
    toolbar,
  };
}
