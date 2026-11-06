---
paths:
  - "apps/*/src/hooks/**/*.ts"
  - "packages/hooks/**/*.ts"
  - "apps/*/src/features/*/hooks/**/*.ts"
---

# Hooks (the logic layer)

- `"use client"` at the top; file `use-<name>.ts`; one exported hook per file.
- A feature hook returns a ready-to-render model: plain values + callbacks named for the view
  (`status`, `rows`, `search`, `setSearch`, `onSubmit`, `errors`). The view must not compute.
- Data: call the ready hooks of `<f>.api.ts` (`useXListQuery(params)`, `useCreateXMutation()`);
  never compose `useQuery`/`useMutation`/`useQueryClient`/`useApiQuery` in a feature hook. UI callbacks go to
  `mutate(vars, { onSuccess })`. `<f>.api.ts` is the one file allowed to hold several hooks.
- Tables (copy `use-users-table.ts`, 3 lines): `const { params, ...controls } =
useTableState(<x>SearchParams); return toTableController(controls, useXListQuery(params));`
  (`@repo/table/to-table-controller`; no debounced `q` here: the search box and text filters
  debounce themselves). The component renders `<DataTableView table columns filters ... />`.
- Other URL state: nuqs parsers from a shared module importing `nuqs/server`.
- Navigation: `useAppRouter()` with `ROUTES`. Forms: react-hook-form + `zodResolver(schema)`
  with the same schema the BFF validates; zod messages are i18n keys.
- Generic hooks live in `@repo/hooks` (`packages/hooks`) and know nothing about any app;
  `src/hooks/` keeps app hooks (`useAppRouter`). Neither imports features.
- Promises handed to the view are wrapped: `() => void doAsync()` (lint: `no-misused-promises`).
