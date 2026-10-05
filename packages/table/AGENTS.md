# packages/table — AGENTS.md

`@repo/table`: headless server-side tables — the API pages, sorts and filters; the UI renders
the current page. Repository rules: [`../../AGENTS.md`](../../AGENTS.md).

- `@repo/table/search-params` — nuqs parsers = the URL contract (`page`, `pageSize`, `q`,
  `sortBy`, `order`). Built on `nuqs/server`, so pages parse `searchParams` with the same parsers.
- `@repo/table/use-table-state` — `useTableState(parsers)`: URL state + `setSearch`, `setFilter`,
  `toggleSort`, `setPage`, `setPageSize`, `resetFilters` (every change except paging → page 1).
- `@repo/table/types` — `TableController`, `DataTableColumn`, `DataTableFilter`.
- No UI and no i18n here: the data-table components live in the app (they render its messages).
