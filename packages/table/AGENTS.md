# packages/table — AGENTS.md

`@repo/table`: headless server-side tables — the API pages, sorts and filters; the UI renders
the current page. Repository rules: [`../../AGENTS.md`](../../AGENTS.md).

- `@repo/table/search-params` — nuqs parsers = the URL contract (`page`, `pageSize`, `q`,
  `sortBy`, `order`). Built on `nuqs/server`, so pages parse `searchParams` with the same parsers.
  `filterParams` has one parser per filter type: `select(values)`, `multiSelect(values)`, `text()`.
- `@repo/table/use-table-state` — `useTableState(parsers)`: URL state + `setSearch`, `setFilter`,
  `toggleFilterOption`, `toggleSort`, `setPage`, `setPageSize`, `resetFilters` (search + filters),
  `clearFilters` (filters only) — every change except paging → page 1 — plus `filters`,
  `activeFilterCount` and `hasFilters`.
- `@repo/table/types` — `TableController`, `DataTableColumn`, `FilterValue`, `FilterOption` and
  `DataTableFilter` (one field of the Filters drawer, discriminated by `type`: `select`,
  `multiSelect` or `text`). A filter's `id` is its URL key and its parser must match its `type`
  (`role: filterParams.select(ROLES)` ↔ `{ id: "role", type: "select", … }`).
- `@repo/table/filters` — pure helpers behind the filter actions: `normalizeFilterValue` (`""`,
  `[]` and unexpected values → `null`), `toggleOption` (multiSelect add/remove), and
  `singleValue` / `listValue` (read a value as a select/text or a multiSelect field needs it).
  Unit tested.
- `@repo/table/data-table-context` — `<DataTableProvider table columns filters searchPlaceholder>`
  and `useDataTable()`: the data-table components read the table from this context instead of props.
- No UI and no i18n here: the data-table components live in the app (they render its messages).
- Tests: `bun test` (`filters`).
