# packages/query — AGENTS.md

`@repo/query`: the React Query layer. Repository rules: [`../../AGENTS.md`](../../AGENTS.md).

- `makeQueryClient`/`getQueryClient` (retry policy: no retry on 4xx; staleTime), `setErrorReporter`
  (global toasts for background refetch errors + non-`silent` mutations). Apps use TanStack
  Query directly: `queryOptions` + ready hooks in each feature's `<f>.api.ts`.
- `register.ts` types React Query for every consumer (`defaultError: ApiError`, mutation meta
  `{ silent }`).
- App-agnostic: no imports from `apps/*`. The app owns the error UI (toasts).
