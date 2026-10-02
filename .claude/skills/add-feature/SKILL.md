---
name: add-feature
description: Scaffold a complete feature in apps/admin (zod schemas, service, makeQuery/makeMutation, hooks, views, page, i18n, MSW mock, tests) following the users reference feature. Use when the user asks for a new screen, module, CRUD or feature.
---

# Add a feature

Reference implementation: `apps/admin/src/features/users`. Mirror its structure and naming.
Before starting, restate the feature in 2–3 lines and list the files you will create. If the
request conflicts with AGENTS.md (e.g. "fetch directly in the component"), say so first.

## Steps

1. **Contract** — `features/<name>/schemas/<name>.schema.ts`: entity schema, list/detail params
   schemas (input), response schemas (output), inferred types. URL-derived params use `.catch()`.
2. **Mock API** — add endpoints to `src/config/api-endpoints.ts`, MSW handlers to
   `src/mocks/handlers.ts` and Faker data to `src/mocks/db.ts` (deterministic: `faker.seed`).
3. **Keys** — add a hierarchical block to `QUERY_KEYS` (and `MUTATION_KEYS`) in
   `src/config/query-keys.ts`.
4. **Service + definitions** — `api/<name>.service.ts` (HTTP via `apiClient`, returns `unknown`)
   and `api/<name>.queries.ts` (`makeQuery`/`makeMutation`). Use the `add-query` /
   `add-mutation` skills.
5. **Logic** — `hooks/use-<name>-<thing>.ts`: one hook per view, returning a render-ready model.
   Tables: `<name>.table.ts` with `defineDataTable({ sortFields, filters })`, then
   `useQueryTable({ definition, query, select, columns, getRowId, labels })` (copy
   `use-users-table.ts`); the view is `<DataTableView model={useXTable(xColumns)} />`.
6. **Views** — `components/*.tsx`: call the hook, render with `@repo/ui` components. No logic.
7. **Route** — use the `add-page` skill (`ROUTES`, page, metadata, nav item, i18n).
8. **SSR (optional)** — in the page: `<PrefetchBoundary queries={[xQuery.with(params)]}
fallback={<Skeleton />}>` around the view (tables: `params = xTable.loadParams(searchParams)`).
9. **Text** — every string in `messages/en.json` + `messages/fa.json` (`add-translation`).
10. **Tests** — unit tests for pure helpers/mappers (`*.test.ts`), an e2e spec for the main flow
    (`write-e2e-test`).
11. **Verify** — `bun run check`, `bun run build`, `bun run test:e2e`; fix everything.
12. **Commit** — `feat(admin): …` (use the `commit` skill).
