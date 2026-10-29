import { expect, test, type Page } from "@playwright/test";

import { registerNewUser, signIn } from "./fixtures";

const switcher = (page: Page) => page.getByRole("combobox", { name: "نمایش به‌عنوان" });
const badge = (page: Page) => page.getByTestId("view-as-badge");
const verifyButtons = (page: Page) => page.getByRole("button", { name: "تأیید", exact: true });

async function pickRole(page: Page, name: string) {
  await switcher(page).click();
  await page.getByRole("option", { name, exact: true }).click();
}

test.describe("role switcher", () => {
  test("a super-admin views the panel as a lawyer, across reloads, until reset", async ({
    page,
  }) => {
    await signIn(page, "/identity-requests");
    await expect(page).toHaveURL(/\/identity-requests$/);
    await expect(verifyButtons(page).first()).toBeVisible();
    await expect(badge(page)).toHaveCount(0);

    await pickRole(page, "وکیل");
    await expect(badge(page)).toHaveText("نمایش به‌عنوان: وکیل");
    await expect(page.getByRole("cell", { name: "حسین کریمی" })).toBeVisible();
    await expect(verifyButtons(page)).toHaveCount(0);
    // The switcher stays, based on the real roles.
    await expect(switcher(page)).toBeVisible();

    await page.reload();
    await expect(badge(page)).toHaveText("نمایش به‌عنوان: وکیل");
    await expect(page.getByRole("cell", { name: "حسین کریمی" })).toBeVisible();
    await expect(verifyButtons(page)).toHaveCount(0);

    await badge(page).getByRole("button", { name: "بازگشت به نقش واقعی" }).click();
    await expect(badge(page)).toHaveCount(0);
    await expect(verifyButtons(page).first()).toBeVisible();

    await pickRole(page, "اپراتور");
    await expect(badge(page)).toBeVisible();
    await pickRole(page, "نقش واقعی");
    await expect(badge(page)).toHaveCount(0);
    await expect(verifyButtons(page).first()).toBeVisible();
  });

  test("logging out clears the override", async ({ page }) => {
    await signIn(page, "/");
    await expect(page).toHaveURL(/\/$/);
    await pickRole(page, "کارآموز");
    await expect(badge(page)).toBeVisible();

    await page.getByRole("button", { name: "حساب کاربری" }).click();
    await page.getByRole("menuitem", { name: "خروج" }).click();
    await expect(page).toHaveURL(/\/login/);

    const cookies = await page.context().cookies();
    expect(cookies.find((cookie) => cookie.name === "gp_view_as")).toBeUndefined();
  });

  test("a non-admin never sees the switcher, even with a forged cookie", async ({
    page,
    context,
    baseURL,
  }) => {
    await registerNewUser(page);
    await context.addCookies([{ name: "gp_view_as", value: "super-admin", url: baseURL! }]);
    await page.goto("/");
    await expect(page.getByRole("button", { name: "حساب کاربری" })).toBeVisible();
    await expect(switcher(page)).toHaveCount(0);
    await expect(badge(page)).toHaveCount(0);
  });
});
