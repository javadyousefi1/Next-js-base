import { expect, test } from "@playwright/test";

import { MEMBER_USER, signIn } from "./fixtures";

test.describe("access control (roles + permissions)", () => {
  test("a member does not see what they may not use", async ({ page }) => {
    await signIn(page, "/en", MEMBER_USER);
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Account" })).toBeVisible(); // the session has loaded

    await expect(page.getByRole("link", { name: "Settings", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Users", exact: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Refresh stats" })).toHaveCount(0);
  });

  test("a member opening a page without access sees a message, not a redirect", async ({
    page,
  }) => {
    await signIn(page, "/en/users", MEMBER_USER);
    await expect(page).toHaveURL(/\/en\/users$/);
    await expect(page.getByRole("heading", { name: "No access", level: 1 })).toBeVisible();

    // A cold load (no session in the cache yet) ends on the same message.
    await page.reload();
    await expect(page.getByRole("heading", { name: "No access", level: 1 })).toBeVisible();
    await expect(page.getByRole("searchbox")).toHaveCount(0);

    await page.getByRole("link", { name: "Back to dashboard" }).click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test("the API refuses a member's request — hiding the page is not the security", async ({
    page,
  }) => {
    await signIn(page, "/en", MEMBER_USER);
    await expect(page.getByRole("button", { name: "Account" })).toBeVisible(); // signed in
    const response = await page.request.get("/api/proxy/users");
    expect(response.status()).toBe(403);
  });

  test("an admin sees the Users link and the Refresh button", async ({ page }) => {
    await signIn(page);
    await expect(page.getByRole("link", { name: "Users", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Refresh stats" })).toBeVisible();
  });
});
