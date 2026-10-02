"use client";

import { useQueryStates, type ParserMap } from "nuqs";

import { TABLE_URL_OPTIONS } from "./search-params";
import type { TableControls, TableState } from "./types";

type UrlPatch = Record<string, string | number | null>;

const BASE_KEYS = new Set(["page", "pageSize", "q", "sortBy", "order"]);

/**
 * URL state of a server-driven table and the actions its UI needs.
 * `parsers` = `tableSearchParams` + the feature's filters; every non-base key is a filter.
 * Every change except paging goes back to page 1.
 *
 * Returns `params` (typed, for the query) and the controls for the data-table components.
 */
export function useTableState<TParsers extends ParserMap>(parsers: TParsers) {
  const [params, setParams] = useQueryStates(parsers, TABLE_URL_OPTIONS);

  // Generic parser map: read/write through the table's own shape.
  const state = params as unknown as TableState & Record<string, unknown>;
  const write = setParams as (patch: UrlPatch) => Promise<unknown>;
  const set = (patch: UrlPatch) => void write(patch);
  const update = (patch: UrlPatch) => set({ ...patch, page: 1 });

  const filterIds = Object.keys(parsers).filter((key) => !BASE_KEYS.has(key));
  const filters = Object.fromEntries(
    filterIds.map((id) => {
      const value = state[id];
      return [id, typeof value === "string" ? value : null];
    }),
  );

  const controls: TableControls = {
    state,
    filters,
    hasFilters: state.q !== "" || filterIds.some((id) => filters[id] !== null),
    setSearch: (q) => update({ q }),
    setFilter: (id, value) => update({ [id]: value }),
    toggleSort: (columnId) => update(nextSort(state, columnId)),
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => update({ pageSize }),
    resetFilters: () => update({ q: "", ...Object.fromEntries(filterIds.map((id) => [id, null])) }),
  };

  return { params, ...controls };
}

/** Clicking a sortable header cycles: ascending → descending → not sorted. */
function nextSort(state: TableState, columnId: string): UrlPatch {
  if (state.sortBy !== columnId) return { sortBy: columnId, order: "asc" };
  if (state.order === "asc") return { sortBy: columnId, order: "desc" };
  return { sortBy: null, order: "asc" };
}
