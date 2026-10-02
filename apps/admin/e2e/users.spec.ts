import { expect, test } from "@playwright/test";

import { signIn } from "./fixtures";

test.describe("users table (URL state + React Query)", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, "/en/users");
    await expect(page).toHaveURL(/\/en\/users$/);
  });

  test("search is debounced and kept in the URL", async ({ page }) => {
    await page.getByRole("searchbox").fill("admin@example");
    await expect(page).toHaveURL(/q=admin(@|%40)example/);
    await expect(page.getByRole("cell", { name: "admin@example.com" })).toBeVisible();
    await expect(page.getByText("1 result")).toBeVisible();
  });

  test("filters by role and resets", async ({ page }) => {
    await page.getByRole("combobox", { name: "Role" }).click();
    await page.getByRole("option", { name: "Admin" }).click();
    await expect(page).toHaveURL(/role=admin/);

    await page.getByRole("button", { name: "Clear filters" }).first().click();
    await expect(page).not.toHaveURL(/role=/);
  });

  test("paginates and sorts on the server", async ({ page }) => {
    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText("Page 2 of")).toBeVisible();

    await page.getByRole("button", { name: "Age", exact: true }).click();
    await expect(page).toHaveURL(/sortBy=age/);
    // Sorting resets the pagination.
    await expect(page).not.toHaveURL(/page=2/);
  });

  test("a shared URL restores the same view (server prefetch)", async ({ page }) => {
    await page.goto("/en/users?q=admin%40example");
    await expect(page.getByRole("searchbox")).toHaveValue("admin@example");
    await expect(page.getByRole("cell", { name: "admin@example.com" })).toBeVisible();
  });
});
