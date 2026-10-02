import { expect, test } from "@playwright/test";

import { signIn } from "./fixtures";

test.describe("i18n, RTL and theme", () => {
  test("the Persian locale renders right-to-left", async ({ page }) => {
    await page.goto("/fa/login");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "fa-IR");
    await expect(page.getByRole("heading", { name: "ورود" })).toBeVisible();
  });

  test("switching language keeps the current page", async ({ page }) => {
    await signIn(page, "/en/users");
    await page.getByRole("button", { name: "Language" }).click();
    await page.getByRole("menuitemradio", { name: "فارسی" }).click();
    await expect(page).toHaveURL(/\/fa\/users$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test("dark mode is applied to <html>", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await page.getByRole("menuitemradio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
