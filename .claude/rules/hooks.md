---
paths:
  - "apps/*/src/hooks/**/*.ts"
  - "apps/*/src/features/*/hooks/**/*.ts"
---

# Hooks (the logic layer)

- `"use client"` at the top; file `use-<name>.ts`; one exported hook per file.
- A feature hook returns a ready-to-render model: plain values + callbacks named for the view
  (`status`, `rows`, `search`, `setSearch`, `onSubmit`, `errors`). The view must not compute.
- Data: only through `*.queries.ts` definitions (`xQuery.useQuery`, `xMutation.useMutation`).
- Tables (copy `use-users-table.ts`): `useQueryStates(<x>SearchParams)` → `xQuery.useQuery({
...params, q: debouncedSearch })` → `useDataTable({ data, rowCount, columns, state: params,
onStateChange: setParams })`. Return `table` + loading flags; the components read `table`.
- Other URL state: nuqs parsers from a shared module importing `nuqs/server`.
- Navigation: `useAppRouter()` with `ROUTES`. Forms: react-hook-form + `zodResolver(schema)`
  with the same schema the BFF validates; zod messages are i18n keys.
- Generic hooks in `src/hooks/` know nothing about features (no feature imports).
- Promises handed to the view are wrapped: `() => void doAsync()` (lint: `no-misused-promises`).
