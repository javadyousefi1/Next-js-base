import {
  createLoader,
  parseAsStringLiteral,
  type inferParserType,
  type ParserMap,
  type SearchParams,
  type SingleParserBuilder,
} from "nuqs/server";

import { tableSearchParams } from "./search-params";

/**
 * Filter id → allowed values. Each filter is a single-choice select kept in the URL (`?role=admin`).
 * Ids must not clash with the base keys (`page`, `pageSize`, `q`, `sortBy`, `order`).
 */
export type TableFilterDefinitions = Record<string, readonly string[]>;

type FilterParsers<TFilters extends TableFilterDefinitions> = {
  [K in keyof TFilters]: SingleParserBuilder<TFilters[K][number]>;
};

/**
 * Declares a server-driven table once — sortable columns + filters — and derives everything from
 * it: the URL parsers (shared by server and client), the server loader and the param types.
 * Imported by the client hook AND by Server Components (`nuqs/server` has no "use client").
 *
 * @example
 * export const usersTable = defineDataTable({
 *   sortFields: USER_SORT_FIELDS,
 *   filters: { role: USER_ROLES },
 * });
 */
export function defineDataTable<
  const TSortFields extends readonly string[],
  const TFilters extends TableFilterDefinitions,
>(config: { sortFields: TSortFields; filters: TFilters }) {
  const filterParsers = Object.fromEntries(
    Object.entries(config.filters).map(([id, options]) => [id, parseAsStringLiteral(options)]),
  ) as FilterParsers<TFilters>;

  const parsers = {
    ...tableSearchParams,
    sortBy: parseAsStringLiteral<TSortFields[number]>(config.sortFields),
    ...filterParsers,
  };
  const load = createLoader(parsers);

  return {
    filters: config.filters,
    parsers,
    /** Server side: the same params the client hook sends (for `xQuery.with(...)`). */
    loadParams: (searchParams: Promise<SearchParams>) => load(searchParams),
  };
}

/** Structural type of any `defineDataTable(...)` result. */
export type DataTableDefinition = {
  filters: TableFilterDefinitions;
  parsers: ParserMap;
};

/** Query params produced by a table: page, pageSize, q, sortBy, order + one key per filter. */
export type DataTableParams<TDefinition extends DataTableDefinition> = inferParserType<
  TDefinition["parsers"]
>;
