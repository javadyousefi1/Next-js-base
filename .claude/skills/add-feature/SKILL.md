---
name: add-feature
description: Scaffold a complete feature in apps/sample (zod schemas, <f>.api.ts with queryOptions/mutationOptions, hooks, views, page, i18n, MSW mock, tests) following the users reference feature. Use when the user asks for a new screen, module, CRUD or feature.
---

# Add a feature

Reference implementations: `apps/sample/src/features/users` (read-only table) and
`features/tasks` (CRUD: form in `modal.open`, delete with `modal.confirm` + `onAction`). Mirror
their structure and naming.
Before starting, restate the feature in 2–3 lines and list the files you will create. If the
request conflicts with AGENTS.md (e.g. "fetch directly in the component"), say so first.

## Steps

1. **Contract** — `features/<name>/schemas/<name>.schema.ts`: domain types (what views use) and
   list/detail params schemas (input; URL-derived params use `.catch()`). The backend's shapes go
   in `<name>.api.ts` (step 3).
2. **Mock API** — MSW handlers in
   `src/mocks/handlers.ts` (importing the endpoint const from `<name>.api.ts`) and Faker data to `src/mocks/db.ts` (deterministic: `faker.seed`).
3. **API file** — `features/<name>/<name>.api.ts`: endpoint const, backend schemas + mapping,
   hierarchical keys (`<name>Keys`), `queryOptions` factories, ready hooks (`use<Name>ListQuery`, `useCreate<Name>Mutation`). Use the
   `add-query` / `add-mutation` skills.
4. **Cross-feature refresh** — a mutation that changes another feature's data invalidates its
   keys too (`Promise.all([...invalidateQueries])` in `onSuccess`).
5. **Logic** — `hooks/use-<name>-<thing>.ts`: one hook per view, returning a render-ready model.
   Tables: `<name>.search-params.ts` (`{ ...tableSearchParams, sortBy, <filters> }`, each filter
   `filterParams.select|multiSelect|text(…)`), a 3-line hook
   `toTableController(controls, use<Name>ListQuery(params))` (copy `use-users-table.ts`), `columns`
   and `filters` arrays (each filter has a `type`), and a view with
   `<DataTableView table columns filters searchPlaceholder />` (copy `users-table.tsx`).
6. **Views** — `components/*.tsx`: call the hook, render with `@repo/ui` components. No logic.
7. **Route** — use the `add-page` skill (`ROUTES`, page, metadata, nav item, i18n).
8. **Page** — no prefetch: the view goes in `<Suspense fallback={<Skeleton />}>`; the client loads.
9. **Text** — every string in `messages/en.json` + `messages/fa.json` (`add-translation`).
10. **Tests** — unit tests for pure helpers/mappers (`*.test.ts`), an e2e spec for the main flow
    (`write-e2e-test`).
11. **Verify** — `bun run check`, `bun run build`, `bun run test:e2e`; fix everything.
12. **Commit** — `feat(sample): …` (use the `commit` skill).
