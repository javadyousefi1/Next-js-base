---
name: write-e2e-test
description: Write Playwright end-to-end tests for apps/admin the way this repo does (production build + MSW mocks, role-based locators, URL assertions). Use when a user flow is added or changed, or when asked for e2e tests.
---

# Write an e2e test

- Location: `apps/admin/e2e/<area>.spec.ts`. Shared steps: `e2e/fixtures.ts` (`signIn(page, path, user?)`,
  `DEMO_USER` = admin, `MEMBER_USER` = no users access).
- The suite runs against `next start` with `API_MOCKING=enabled` (MSW + Faker, seeded data), so
  data is deterministic — e.g. `admin@example.com` always exists.
- Locators: `getByRole`, `getByLabel`, `getByText` with the English copy from `messages/en.json`.
  Use `{ exact: true }` when names overlap ("Age" vs "Next page"). Never CSS classes, never
  `waitForTimeout`.
- URL state (search, filters, sort, page) is asserted with `expect(page).toHaveURL(/q=…/)`.
- Auth: protected pages redirect to `/en/login?callbackUrl=…`; tokens are httpOnly
  (`context.cookies()` sees them, `document.cookie` must not).
- RTL: check `html[dir="rtl"]` and `lang` on `/fa/...`.

```ts
import { expect, test } from "@playwright/test";
import { signIn } from "./fixtures";

test("filters users by role", async ({ page }) => {
  await signIn(page, "/en/users");
  // Filters live in a side drawer and apply at once (no apply button).
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByRole("combobox", { name: "Role" }).click();
  await page.getByRole("option", { name: "Admin" }).click();
  await expect(page).toHaveURL(/role=admin/);
  await page.keyboard.press("Escape"); // closes the drawer
  await expect(page.getByRole("button", { name: "Filters, 1 active" })).toBeVisible();
});
```

Run: `bun run test:e2e` (root; builds first) or `cd apps/admin && bunx playwright test --ui`.
Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use a preinstalled Chromium.
