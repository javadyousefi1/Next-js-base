import { parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs/server";

export const SORT_ORDERS = ["asc", "desc"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export const PAGE_SIZES = [10, 20, 50] as const;

/**
 * URL state shared by every server-driven table. Imported from `nuqs/server` (no "use client"),
 * so the same parsers serve the client hook (`useQueryStates`) and the server loader
 * (`createLoader`) — the server-side prefetch and the browser compute the same query key.
 */
export const tableSearchParams = {
  page: parseAsInteger.withDefault(1),
  pageSize: parseAsInteger.withDefault(PAGE_SIZES[0]),
  q: parseAsString.withDefault(""),
  sortBy: parseAsString,
  order: parseAsStringLiteral(SORT_ORDERS).withDefault("asc"),
};
