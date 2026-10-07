---
paths:
  - "apps/*/src/app/**/*.tsx"
  - "apps/*/src/components/**/*.tsx"
  - "apps/*/src/features/*/components/**/*.tsx"
---

# Views (components + pages)

- Render only. Call ONE feature hook (e.g. `useUsersTable()`), `useTranslations`, and render its
  result. No `useState`/`useEffect`/`useQuery`/`useForm`/`fetch`/axios — move logic into
  `features/<name>/hooks/` (lint: `project/no-logic-in-views`). Shared data-table views
  (`components/data-table`) read the table with `useDataTable()`; text inputs use
  `useDebouncedInput()` (`@repo/hooks`).
- Props in, JSX out. Event handlers only forward to callbacks the hook returned.
- Pages (`app/**/page.tsx`) are Server Components: compose views, `generateMetadata` via
  `pageMetadata()`, request-time work inside `<Suspense>`.
- Classes: static string, or `cn(...)` when conditional/composed (lint:
  `project/cn-for-conditional-classes`). RTL-safe logical classes (`ms-*`, `pe-*`, `start-*`,
  `text-start`); directional icons get `rtl:rotate-180`.
- Every visible string comes from `messages/{en,fa}.json`.
- Links: `<Link href={ROUTES.x}>` from `@/i18n/navigation`; UI from `@repo/ui/components/*`.
- Accessibility: one `<h1>` per page, labels for inputs, `aria-label` on icon-only buttons.
