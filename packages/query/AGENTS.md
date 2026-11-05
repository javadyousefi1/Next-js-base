# packages/query — AGENTS.md

`@repo/query`: the React Query layer. Repository rules: [`../../AGENTS.md`](../../AGENTS.md).

- `makeQueryClient`/`getQueryClient` (retry policy: no retry on 4xx; staleTime), `setErrorReporter`
  (global toasts for background refetch errors + non-`silent` mutations). Apps use TanStack
  Query directly (`queryOptions`, `useQuery`, `useMutation`).
- **Deprecated, golden_pen only** (removed after its migration): `createMakeQuery`/`makeQuery`,
  `makeMutation`, `invalidateKeys`, `useInvalidate`, `parseInput`, `labelFromKey`.
- `register.ts` types React Query for every consumer (`defaultError: ApiError`, query/mutation meta).
- App-agnostic: no imports from `apps/*`. The app owns the error UI (toasts).
- Tests: `bun test` (`invalidate`, `validation`).
