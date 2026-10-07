import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const PAGE_SIZES = [10, 20, 50] as const;

/**
 * URL keys every server-driven table has. A feature spreads them and adds its own:
 * `{ ...tableSearchParams, sortBy: parseAsStringLiteral(FIELDS), role: filterParams.select(ROLES) }`.
 * Imported from `nuqs/server` (no "use client"): the same parsers serve `useQueryStates` in the
 * browser and `createLoader` on the server, so both build the same query key.
 */
export const tableSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(PAGE_SIZES[0]),
  q: parseAsString.withDefault(""),
  sortBy: parseAsString,
  order: parseAsStringLiteral(SORT_ORDERS).withDefault("asc"),
};

/**
 * URL parser per filter type — pair each with a filter of the same `type`:
 * `role: filterParams.select(USER_ROLES)` ↔ `{ id: "role", type: "select", … }`.
 */
export const filterParams = {
  select: <const T extends string>(values: readonly T[]) => parseAsStringLiteral(values),
  multiSelect: <const T extends string>(values: readonly T[]) =>
    parseAsArrayOf(parseAsStringLiteral(values)),
  text: () => parseAsString,
};

/** nuqs options for table state: no history entry per change, defaults removed from the URL. */
export const TABLE_URL_OPTIONS = { history: "replace", clearOnDefault: true } as const;
