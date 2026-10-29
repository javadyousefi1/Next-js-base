import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./fixtures";

/** Cumulative layout shift allowed on a page: nothing may visibly jump. */
const MAX_CLS = 0.05;

/** Starts summing `layout-shift` entries (without recent input) in every document of the page. */
async function observeLayoutShift(page: Page) {
  await page.addInitScript(() => {
    const state = { cls: 0 };
    Object.assign(window, { layoutShiftState: state });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!shift.hadRecentInput) state.cls += shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}

async function readLayoutShift(page: Page): Promise<number> {
  return page.evaluate(
    () => (window as unknown as { layoutShiftState: { cls: number } }).layoutShiftState.cls,
  );
}

const PAGES = [
  { name: "dashboard", path: "/", ready: "greeting" },
  { name: "users", path: "/users", ready: "pagination" },
  { name: "invite-links", path: "/invite-links", ready: "pagination" },
  { name: "identity-requests", path: "/identity-requests", ready: "pagination" },
  { name: "profile", path: "/profile", ready: "avatar" },
  { name: "profile identity tab", path: "/profile?tab=identity", ready: "avatar" },
] as const;

// The API is mocked (MSW), so the numbers are deterministic enough for a threshold.
test.describe("layout shift", () => {
  for (const { name, path, ready } of PAGES) {
    test(`${name} does not jump while it loads`, async ({ page }) => {
      await observeLayoutShift(page);
      await signIn(page, "/");
      await expect(page).toHaveURL(/\/$/);

      await page.goto(path);
      const marker = {
        greeting: page.getByTestId("greeting"),
        pagination: page.getByText(/نتیجه$/).first(),
        avatar: page.getByTestId("profile-avatar"),
      }[ready];
      await expect(marker).toBeVisible();
      // The sidebar footer (role switcher + user menu) is part of every page: it must not shift either.
      await expect(page.getByRole("combobox", { name: "نمایش به‌عنوان" })).toBeVisible();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);

      const cls = await readLayoutShift(page);
      console.log(`CLS ${name}: ${cls.toFixed(4)}`);
      expect(cls).toBeLessThan(MAX_CLS);
    });
  }
});
