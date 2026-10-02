---
paths:
  - "apps/*/src/features/*/api/**"
  - "apps/*/src/features/*/schemas/**"
  - "apps/*/src/features/*/*.search-params.ts"
  - "apps/*/src/lib/query/**"
  - "apps/*/src/lib/table/**"
  - "apps/*/src/lib/http/**"
  - "apps/*/src/config/query-keys.ts"
  - "apps/*/src/config/api-endpoints.ts"
  - "apps/*/src/mocks/**"
---

# Data fetching

- Order: zod schemas (`schemas/`) → service (`api/<x>.service.ts`, HTTP only, returns `unknown`)
  → definition (`api/<x>.queries.ts`, `makeQuery`/`makeMutation`) → hook.
- Fetchers are transport-agnostic: `(params, { http, signal }) => http.get(API_ENDPOINTS.…)`.
  `http` is `apiClient` in the browser and the authenticated upstream client during server
  prefetch, so every query works in `<PrefetchBoundary>` with zero extra code.
- `makeQuery({ key: QUERY_KEYS.…, params, response, fetcher, relatedKeys?, staleTime? })`:
  `params` validates input before the request, `response` validates output before the cache.
  There is no `name` — errors are labelled from the key constant (`users.list`).
- `makeMutation({ mutationKey: MUTATION_KEYS.…, variables, response, mutationFn, invalidates })`.
  Use `silent: true` only when the view renders the error itself.
- Keys: add them to `src/config/query-keys.ts` (hierarchical `all → lists → list(params)`); never
  inline arrays (lint: `project/no-inline-query-keys`).
- Endpoints: paths in `src/config/api-endpoints.ts` (the BFF proxy maps them 1:1). Server-only
  code calls `upstreamGet(url, schema)` / `upstreamPost(url, body, schema)` — validated and
  labelled by the endpoint. `bffClient` is only for login/logout (they set cookies).
- Tables: `<x>.search-params.ts` (nuqs parsers) + `useTableState` + plain `columns`/`filters`
  arrays + `<DataTableToolbar|DataTable|DataTablePagination table={table}>`. No table library.
  Never a per-page toolbar, URL-state hook or prefetch function.
- Every upstream endpoint used by the app has an MSW handler in `src/mocks/handlers.ts` with
  Faker data in `src/mocks/db.ts`, so the app runs without a backend (`API_MOCKING=enabled`).
- Errors are `ApiError` (`code`, `status`, `retryAfterSeconds`); branch on `code`, never on text.
