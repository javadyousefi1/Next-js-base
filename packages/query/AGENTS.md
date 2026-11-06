# packages/query — AGENTS.md

`@repo/query`: the React Query layer. Repository rules: [`../../AGENTS.md`](../../AGENTS.md).

- `makeQueryClient`/`getQueryClient` (retry policy: no retry on 4xx; staleTime), `setErrorReporter`
  (global toasts for background refetch errors + non-`silent` mutations). `createApiHooks(client)` →
  `{ useApiQuery, useApiMutation }`: an app binds it once (`src/lib/query/api-hooks.ts`), features
  declare `key/url/params/schema` or `method/url/body/invalidates` in `<f>.api.ts`.
- `register.ts` types React Query for every consumer (`defaultError: ApiError`, mutation meta
  `{ silent }`).
- App-agnostic: no imports from `apps/*`. The app owns the error UI (toasts).
