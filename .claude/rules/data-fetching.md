---
paths:
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

- Order: domain types + params schema (`schemas/`) → backend contract (`api/<x>.backend.ts`) →
  service (`api/<x>.service.ts`, HTTP only, returns `unknown`) → definition (`api/<x>.queries.ts`,
  `makeQuery`/`makeMutation`) → hook.
- Only `*.backend.ts` knows backend field names, query params and envelopes. Its response schema
  is typed against the domain: `z.ZodType<Domain>` when the shapes match, a typed `.transform()`
  when they differ. Views/hooks never read backend-only fields (lists are `{ items, total }`).
- Fetchers are transport-agnostic: `(params, { http, signal }) => http.get(API_ENDPOINTS.…)`.
  `http` is `apiClient` in the browser and the authenticated upstream client during server
  prefetch, so every query works in `<PrefetchBoundary>` with zero extra code. Both are
  `HttpClient` instances: they resolve to the data or throw an `ApiError` (never axios types).
- `makeQuery({ key: QUERY_KEYS.…, params, response, fetcher, relatedKeys?, staleTime? })`:
  `params` validates input before the request, `response` validates output before the cache.
  There is no `name` — errors are labelled from the key constant (`users.list`).
- `makeMutation({ mutationKey: MUTATION_KEYS.…, variables, response, mutationFn, invalidates })`.
  Use `silent: true` only when the view renders the error itself.
- Keys: add them to `src/config/query-keys.ts` (hierarchical `all → lists → list(params)`); never
  inline arrays (lint: `project/no-inline-query-keys`).
- Endpoints: paths in `src/config/api-endpoints.ts` (the BFF proxy maps them 1:1). Server-only
  code passes the schema to the client: `upstream.get(url, { schema })` /
  `upstream.post(url, body, { schema })` — validated and labelled by the endpoint. `bffClient` is
  only for login/logout (they set cookies).
- Tables: `<x>.search-params.ts` (nuqs parsers; filters via `filterParams.select|multiSelect|text`),
  `useTableState`, plain `columns`/`filters` arrays (every filter has a `type`), and
  `<DataTableProvider table columns filters searchPlaceholder>` around the prop-less
  `<DataTableToolbar|DataTable|DataTablePagination />`. No table library. Never a per-page
  toolbar, URL-state hook or prefetch function.
- Every upstream endpoint used by the app has an MSW handler in `src/mocks/handlers.ts` with
  Faker data in `src/mocks/db.ts`, so the app runs without a backend (`API_MOCKING=enabled`).
- Errors are `ApiError` (`code`, `status`, `retryAfterSeconds`); branch on `code`, never on text.
  Invalid input → `VALIDATION`; unexpected response → `INVALID_RESPONSE` (zod tree logged in dev);
  4xx are not retried; background failures toast, a first-load failure renders `<QueryError>`;
  a 401 in the browser emits `unauthorized` → redirect to login. Error messages need no code:
  `@repo/http` reads `message`, `error`, `detail`, `title` or `errors[0]`.
- `<PrefetchBoundary queries={[xQuery.with(params)]}>` (params may be a promise) wraps itself in
  `<Suspense>`, runs each fetcher on the server with the user's token and dehydrates the cache.
