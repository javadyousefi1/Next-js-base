import { expect, test } from "@playwright/test";

import { signIn } from "./fixtures";

test.describe("theme", () => {
  test("dark mode is applied to <html>", async ({ page }) => {
    await signIn(page);
    await page.getByRole("button", { name: "تغییر پوسته" }).click();
    await page.getByRole("menuitemradio", { name: "تیره" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });
});
