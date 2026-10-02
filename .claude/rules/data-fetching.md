---
paths:
  - "apps/*/src/features/*/api/**"
  - "apps/*/src/features/*/schemas/**"
  - "apps/*/src/lib/query/**"
  - "apps/*/src/lib/http/**"
  - "apps/*/src/config/query-keys.ts"
  - "apps/*/src/config/api-endpoints.ts"
  - "apps/*/src/mocks/**"
---

# Data fetching

- Order: zod schemas (`schemas/`) → service (`api/<x>.service.ts`, HTTP only, returns `unknown`)
  → definition (`api/<x>.queries.ts`, `makeQuery`/`makeMutation`) → hook.
- `makeQuery({ name, key: QUERY_KEYS.…, params, response, fetcher, relatedKeys?, staleTime? })`.
  `params` validates input before the request, `response` validates output before the cache.
- `makeMutation({ name, mutationKey: MUTATION_KEYS.…, variables, response, mutationFn,
invalidates })`. Use `silent: true` only when the view renders the error itself.
- Keys: add them to `src/config/query-keys.ts` (hierarchical `all → lists → list(params)`); never
  inline arrays (lint: `project/no-inline-query-keys`).
- Endpoints: add paths to `src/config/api-endpoints.ts`; browser code uses `apiClient`
  (→ `/api/proxy`) or `bffClient` (→ `/api/auth/*`); server code uses `upstream` + `bearer()`.
- Every upstream endpoint used by the app has an MSW handler in `src/mocks/handlers.ts` with
  Faker data in `src/mocks/db.ts`, so the app runs without a backend (`API_MOCKING=enabled`).
- Errors are `ApiError` (`code`, `status`, `retryAfterSeconds`); branch on `code`, never on text.
