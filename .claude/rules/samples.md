---
paths:
  - "packages/*/src/**"
  - "packages/*/package.json"
  - "apps/sample/src/config/examples.ts"
  - "apps/sample/src/features/examples/**"
  - "scripts/check-examples.ts"
---

# Samples (AGENTS.md §6)

- Every package, public module (`exports` path) and index export is used by `apps/sample`;
  `bun run check` runs `scripts/check-examples.ts` and names what is missing.
- New or changed API in a package → show it in its example page: `src/config/examples.ts` lists
  the pages (`key`, `href`, `icon`, `packages`); each page is
  `src/app/[locale]/(app)/examples/<key>/page.tsx` + views/hooks in `src/features/examples/`
  (a real data feature: its own `features/<name>/`, like `features/tasks`).
- A new example page: `ROUTES.examples<Key>`, `BREADCRUMBS`, `Nav.<key>` and `Examples.<key>`
  (`title`, `description`, texts) in both message files, an e2e check in `e2e/examples.spec.ts`.
- Only plumbing that apps never call directly goes in `PLUMBING` (with a reason) instead.
- Demos stay real and small: the same rules as product code (hooks hold the logic, i18n, RTL).
