---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "apps/*/e2e/**"
  - "apps/*/playwright.config.ts"
---

# Tests

- Unit: `*.test.ts` next to the code, `bun test` (`import { describe, expect, test } from "bun:test"`).
  Test logic (hooks' pure helpers, `lib/`, mappers, schemas), not markup.
- Lint rules (`packages/oxlint-plugin`): `RuleTester` + `node --test` (Oxlint's tester needs Node).
- E2E: Playwright against the production build with MSW. Query by role/label/text
  (`getByRole("button", { name: "Next page" })`, `exact: true` when names overlap), assert URLs
  for URL state, never CSS selectors or sleeps. Shared steps live in `e2e/fixtures.ts`.
- Demo accounts (MSW): `admin` / `admin123` and `member` / `member123` (role `user`: no users
  access; `MEMBER_USER` in `e2e/fixtures.ts`). New endpoints need MSW handlers first.
