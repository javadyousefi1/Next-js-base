# packages/query — AGENTS.md

`@repo/query`: the React Query layer. Repository rules: [`../../AGENTS.md`](../../AGENTS.md).

- `createMakeQuery(http)` → `makeQuery({ key, params, response, fetcher, relatedKeys })` and
  `makeMutation({ mutationKey, variables, response, mutationFn, invalidates })`: input and output
  are parsed with zod, errors are `ApiError` (`@repo/http`).
- `invalidateKeys` (follows `relatedKeys` transitively), `makeQueryClient`/`getQueryClient`
  (retry + dehydrate defaults), `setErrorReporter`, `useInvalidate`.
- `register.ts` types React Query for every consumer (`defaultError: ApiError`, query/mutation meta).
- App-agnostic: no imports from `apps/*`. The app binds its browser client once
  (`export const makeQuery = createMakeQuery(apiClient)`) and owns the error UI (toasts).
- Tests: `bun test` (`invalidate`, `validation`).
