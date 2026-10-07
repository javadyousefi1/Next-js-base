import { expect, test } from "@playwright/test";

import { DEMO_USER, signIn } from "./fixtures";

test.describe("authentication (BFF + httpOnly cookies)", () => {
  test("protected pages redirect to login with a callback URL", async ({ page }) => {
    await page.goto("/en/users?page=2");
    await expect(page).toHaveURL(/\/en\/login\?callbackUrl=%2Fusers%3Fpage%3D2/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("validates the form with the shared zod schema", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Username is required.")).toBeVisible();
    await expect(page.getByText("Password must be at least 6 characters.")).toBeVisible();
  });

  test("rejects wrong credentials", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByLabel("Username").fill(DEMO_USER.username);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid username or password.")).toBeVisible();
  });

  test("signs in, returns to the requested page, and signs out", async ({ page, context }) => {
    await signIn(page, "/en/settings");
    await expect(page).toHaveURL(/\/en\/settings$/);
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();

    // Tokens are httpOnly: invisible to JavaScript.
    const cookies = await context.cookies();
    expect(cookies.find((cookie) => cookie.name === "access_token")?.httpOnly).toBe(true);
    expect(await page.evaluate(() => document.cookie)).not.toContain("access_token");

    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/en\/login$/);
  });

  test("a request without a session sends the user back to login", async ({ page, context }) => {
    await signIn(page, "/en/users");
    await expect(page).toHaveURL(/\/en\/users$/);
    await expect(page.getByRole("searchbox")).toBeVisible(); // the page has loaded

    // No cookies → the BFF answers 401 → HttpClient onError → "session expired" redirect.
    await context.clearCookies();
    await page.getByRole("searchbox").fill("admin");
    await expect(page).toHaveURL(/\/en\/login\?callbackUrl=%2Fusers$/);
  });
});
