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

  test("filters by role in the drawer and resets", async ({ page }) => {
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    await page.getByRole("combobox", { name: "Role" }).click();
    await page.getByRole("option", { name: "Admin" }).click();
    // Filters apply at once: no apply button.
    await expect(page).toHaveURL(/role=admin/);

    // Escape closes the drawer; the Filters button now shows how many filters are set.
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: "Filters, 1 active" })).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).first().click();
    await expect(page).not.toHaveURL(/role=/);
  });

  test("clearing the filters also empties the search box", async ({ page }) => {
    const search = page.getByRole("searchbox");
    await search.fill("admin");
    await expect(page).toHaveURL(/q=admin/);

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page).not.toHaveURL(/q=/);
    await expect(search).toHaveValue("");
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

  test("the breadcrumb shows the trail and links back to the dashboard", async ({ page }) => {
    const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
    const dashboard = breadcrumb.getByRole("link", { name: "Dashboard" });
    await expect(dashboard).toBeVisible();
    await expect(breadcrumb.getByText("Users")).toHaveAttribute("aria-current", "page");

    await dashboard.click();
    await expect(page).toHaveURL(/\/en$/);
  });
});
