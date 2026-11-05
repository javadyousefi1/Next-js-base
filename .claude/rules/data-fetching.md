---
paths:
  - "apps/*/src/features/*/*.api.ts"
  - "apps/*/src/features/*/*.backend.ts"
  - "apps/*/src/features/*/api/**"
  - "apps/*/src/features/*/schemas/**"
  - "apps/*/src/features/*/*.search-params.ts"
  - "apps/*/src/lib/query/**"
  - "apps/*/src/lib/http/**"
  - "packages/http/**"
  - "packages/query/**"
  - "packages/table/**"
  - "apps/*/src/config/query-keys.ts"
  - "apps/*/src/config/api-endpoints.ts"
  - "apps/*/src/mocks/**"
---

# Data fetching

`apps/sample` uses TanStack Query directly. (`apps/golden_pen` still uses the deprecated
`makeQuery`/`makeMutation` of `@repo/query` until it migrates — don't copy that in sample.)

- One file per feature, `features/<f>/<f>.api.ts`, in this order: endpoint const → backend zod
  schemas + mapping (`toBackendListQuery`, response `.transform()` typed as the domain) → keys
  (`usersKeys = { all, list(p) }`, hierarchical) → `queryOptions` factories → mutation options.
  Only this file knows backend field names, query params and envelopes; views/hooks only see
  the domain (lists are `{ items, total }`). Server-only endpoints (auth tokens) live in
  `<f>.backend.ts` so server code never imports client code.
- Queries: `queryOptions({ queryKey: xKeys.list(p), queryFn: ({ signal }) => apiClient.get(EP,
{ params, signal, schema }), staleTime })`; the hook calls `useQuery(xQuery(p))`. `schema`
  validates the response (`INVALID_RESPONSE`) and types the data. Keys are declared in
  `<f>.api.ts` only; inline arrays elsewhere are lint errors (`project/no-inline-query-keys`).
- Mutations: `mutationOptions({ mutationFn, meta: { silent: true }, onSuccess: () =>
queryClient.invalidateQueries({ queryKey: xKeys.all }) })`. Cross-feature refresh = one more
  `invalidateQueries` in the same `onSuccess` (`Promise.all`). `silent: true` only when the view
  renders the error itself. Callers add behaviour with `mutate(vars, { onSuccess })` so the
  invalidation is not replaced.
- `apiClient` (browser → BFF `/api/proxy`) and `bffClient` (login/logout only) are `HttpClient`
  instances: they resolve to the data or throw an `ApiError` (never raw fetch errors).
  Server-only code uses `upstream.get(url, { schema })`.
- No server prefetch/hydration: a page renders the header and the client view inside
  `<Suspense fallback={<DataTableSkeleton />}>` (nuqs reads the URL on the client).
- Tables: `<x>.search-params.ts` (nuqs parsers; filters via `filterParams.select|multiSelect|text`),
  `useTableState`, plain `columns`/`filters` arrays (every filter has a `type`), and
  `<DataTableProvider table columns filters searchPlaceholder>` around the prop-less
  `<DataTableToolbar|DataTable|DataTablePagination />`. No table library. Never a per-page
  toolbar or URL-state hook.
- Every upstream endpoint used by the app has an MSW handler in `src/mocks/handlers.ts` with
  Faker data in `src/mocks/db.ts`, so the app runs without a backend (`API_MOCKING=enabled`).
- Errors are `ApiError` (`code`, `status`, `retryAfterSeconds`); branch on `code`, never on text.
  4xx are not retried; background failures toast, a first-load failure renders `<QueryError>`;
  a 401 in the browser emits `unauthorized` → redirect to login. Error messages need no code:
  `@repo/http` reads `message`, `error`, `detail`, `title` or `errors[0]`.
