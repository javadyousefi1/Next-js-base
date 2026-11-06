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
  - "apps/*/src/mocks/**"
---

# Data fetching

`apps/sample` and `apps/golden_pen` write ready hooks with `useApiQuery`/`useApiMutation`
(`@/lib/query/api-hooks`, from `createApiHooks` in `@repo/query`).

- One file per feature, `features/<f>/<f>.api.ts`, in this order: endpoint const → backend zod
  schemas + mapping (`toBackendListQuery`, response `.transform()` typed as the domain) → keys
  (`usersKeys = { all, list(p) }`, hierarchical) → ready hooks
  (`useXListQuery`, `useCreateXMutation`). `<f>.api.ts` is the one file allowed to hold several
  hooks (exception to "one hook per file").
  Only this file knows backend field names, query params and envelopes; views/hooks only see
  the domain (lists are `{ items, total }`). Server-only endpoints (auth tokens) live in
  `<f>.backend.ts` so server code never imports client code.
- Queries: one-expression consts, no `queryOptions` factory: `export const useXListQuery = (p) =>
useApiQuery({ key: xKeys.list(p), url: EP, params: toBackendListQuery(p), schema, keepPrevious:
true, staleTime })` (`keepPrevious` for tables, `enabled`, `client` optional). `schema` validates
  the response (`INVALID_RESPONSE`) and types the data. Keys are declared in `<f>.api.ts` only;
  inline arrays elsewhere are lint errors (`project/no-inline-query-keys`).
- Mutations: `export const useCreateXMutation = () => useApiMutation({ method: "POST", url: EP,
body: (input: XInput) => toBody(input), schema, invalidates: [xKeys.all], silent: true })`.
  `url` may be a function of the input; `invalidates` a key list or `(data, vars) => keys`;
  `onSuccess(data, vars, queryClient)` for cache writes (`setQueryData`). No `useQueryClient`
  in features (a tiny `useRefreshX` only when a view needs a manual refresh). `silent: true` only
  when the view renders the error itself. Callers add behaviour with `mutate(vars, { onSuccess })`
  so the invalidation is not replaced.
- `apiClient` (browser → BFF `/api/proxy`) and `bffClient` (login/logout only) are `HttpClient`
  instances: they resolve to the data or throw an `ApiError` (never raw fetch errors).
  Server-only code uses `upstream.get(url, { schema })`.
- No server prefetch/hydration: a page renders the header and the client view inside
  `<Suspense fallback={<DataTableSkeleton />}>` (nuqs reads the URL on the client).
- Tables: `<x>.search-params.ts` (nuqs parsers; filters via `filterParams.select|multiSelect|text`),
  `useTableState`, plain `columns`/`filters` arrays (every filter has a `type`), and
  the hook is `toTableController(controls, useXListQuery(params))` and the view is
  `<DataTableView table columns filters searchPlaceholder />` (toolbar + rows + pagination; in
  golden_pen the toolbar stays in the page's own Suspense). No table library. Never a per-page
  toolbar or URL-state hook.
- Every upstream endpoint used by the app has an MSW handler in `src/mocks/handlers.ts` with
  Faker data in `src/mocks/db.ts`, so the app runs without a backend (`API_MOCKING=enabled`).
- Errors are `ApiError` (`code`, `status`, `retryAfterSeconds`); branch on `code`, never on text.
  4xx are not retried; background failures toast, a first-load failure renders `<QueryError>`;
  a 401 in the browser emits `unauthorized` → redirect to login. Error messages need no code:
  `@repo/http` reads `message`, `error`, `detail`, `title` or `errors[0]`.
