---
name: add-table
description: Add a server-driven table to apps/admin (search, filters drawer generated from config, sorting, pagination, URL state, server prefetch) or a filter to an existing table. Use whenever a list/table screen or a new filter is needed.
---

# Add a table (or a filter)

Plain React, no table library: the API pages, sorts and filters; the UI renders the current page.
Reference: `features/users` (`users.search-params.ts`, `use-users-table.ts`, `users-table.tsx`,
`users-columns.tsx`, `users-filters.ts`). The list query itself: skill `add-query`.

1. **URL contract** — `features/<x>/<x>.search-params.ts` (`nuqs/server`: shared with the page):

   ```ts
   export const usersSearchParams = {
     ...tableSearchParams, // @repo/table/search-params: page, pageSize, q, sortBy, order
     sortBy: parseAsStringLiteral(USER_SORT_FIELDS),
     role: filterParams.select(USER_ROLES), // every extra key is a filter: select · multiSelect · text
   };
   export const loadUsersSearchParams = createLoader(usersSearchParams);
   ```

2. **Params schema + backend** — every filter is also a field of the list params schema
   (`.catch()` to its default; a multiSelect maps `[]` to `null`, so `?x=` and no `x` share one
   cache entry) and a backend param in `toBackendListQuery` (`<x>.backend.ts`).
3. **Hook** — `hooks/use-<x>-table.ts` (no debounce here: the inputs debounce themselves):

   ```ts
   const { params, ...controls } = useTableState(usersSearchParams);
   const query = usersListQuery.useQuery(params, { placeholderData: keepPreviousData });
   return {
     ...controls,
     rows: query.data?.items ?? NO_ROWS,
     total: query.data?.total ?? 0,
     isLoading: query.isPending,
     isFetching: query.isFetching,
     isError: query.isError && query.data === undefined,
     retry: () => void query.refetch(),
   };
   ```

4. **Columns and filters** — plain arrays from `components/<x>-columns.tsx` / `<x>-filters.ts`:

   ```ts
   { id: "age", header: t("columns.age"), sortable: true, cell: (user) => user.age }
   { type: "select", id: "role", title: t("roleFilter"), options: USER_ROLES.map((r) => ({ value: r, label: t(`roles.${r}`) })) }
   { type: "multiSelect", id: "status", title: t("status"), options: [...] }
   { type: "text", id: "company", title: t("company"), placeholder: t("companyHint") }
   ```

   Column ids are the API sort fields. A filter's `id` is its URL key and its parser
   (`filterParams.<type>`) must match its `type`.

5. **View** — the provider (`@repo/table/data-table-context`) hands the table to prop-less parts:

   ```tsx
   <DataTableProvider
     table={table}
     columns={columns}
     filters={filters}
     searchPlaceholder={t("searchPlaceholder")}
   >
     <DataTableToolbar />
     <DataTable />
     <DataTablePagination />
   </DataTableProvider>
   ```

6. **Prefetch (page)** — `<PrefetchBoundary queries={[xListQuery.with(loadXSearchParams(searchParams))]}
fallback={<DataTableSkeleton />}>` around the view.
7. **Tests** — e2e: open `getByRole("button", { name: "Filters", exact: true })`, change a field,
   assert the URL (`toHaveURL(/role=admin/)`); with filters set the button reads
   "Filters, 1 active". Skill `write-e2e-test`.

## How it behaves (don't re-implement)

- `useTableState` actions: `setSearch`, `setFilter`, `toggleFilterOption`, `toggleSort`,
  `setPage`, `setPageSize`, `resetFilters` (search + filters: toolbar, empty state),
  `clearFilters` (filters only: the drawer). Every change except paging → page 1.
- The toolbar ends with a "Filters" button (badge = active filters) opening a Sheet on the
  button's side (right in LTR, left in RTL). No filters in the config → no button.
- Changes apply instantly (no Apply button). The search box and `text` filters commit after a
  300 ms pause or on blur (`useDebouncedInput`); the drawer stays mounted, so Escape never drops
  a pending commit.
- New filter type = a parser in `filterParams`, a member of the `DataTableFilter` union, one
  field component in `components/data-table` and one `case` in `data-table-filter-field.tsx`.
