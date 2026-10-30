import { expect, test } from "@playwright/test";

import { signIn } from "./fixtures";

// Mock data: 27 users (3 identity Pending + 6 Requested; the identity spec reviews some), 12 invite links (9 unused).
test.describe("dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, "/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("shows the greeting, the wall clock and today's dates", async ({ page }) => {
    await expect(page.getByTestId("greeting")).toContainText(/(صبح|ظهر|عصر|شب) بخیر، مدیر/);
    await expect(page.getByTestId("clock")).toHaveText(/^[۰-۹]{2}:[۰-۹]{2}$/);
    await expect(
      page.getByRole("img", { name: /^ساعت [۰-۹]{2}:[۰-۹]{2} (صبح|ظهر|عصر|شب) به وقت تهران$/ }),
    ).toBeVisible();
    await expect(page.getByText(/[۰-۹]+ روز تا نوروز|امروز نوروز است/).first()).toBeVisible();
    await expect(page.getByTestId("jalali-date")).toContainText(/[۰-۹]{4}/);
    await expect(page.getByRole("progressbar", { name: "پیشرفت سال" })).toBeVisible();
  });

  test("shows the counts and links the cards to the filtered pages", async ({ page }) => {
    const users = page.getByRole("link", { name: /کل کاربران/ });
    await expect(users.getByTestId("stat-value")).toHaveText("۲۷");

    const identity = page.getByRole("link", { name: /درخواست‌های هویت در انتظار بررسی/ });
    await expect(identity.getByTestId("stat-value")).toHaveText(/^[۰-۹]+$/);
    const invites = page.getByRole("link", { name: /لینک‌های دعوت استفاده‌نشده/ });
    // 9 seeded; the invite-links spec may have created one in parallel.
    await expect(invites.getByTestId("stat-value")).toHaveText(/^[۰-۹]+$/);
    const unused = await invites.getByTestId("stat-value").textContent();

    await identity.click();
    await expect(page).toHaveURL(/\/identity-requests$/);
    await expect(page.getByRole("tab", { name: "در انتظار بررسی" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await page.goBack();
    await page.getByRole("link", { name: /لینک‌های دعوت استفاده‌نشده/ }).click();
    await expect(page).toHaveURL(/\/invite-links\?isUsed=false$/);
    await expect(page.getByText(`${unused} نتیجه`)).toBeVisible();
  });

  test("the quick action opens the invite link modal", async ({ page }) => {
    await page
      .getByTestId("quick-actions")
      .getByRole("button", { name: "ایجاد لینک دعوت" })
      .click();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "ایجاد لینک" }),
    ).toBeVisible();
  });

  test("the quick links go to the identity requests, the profile and the users", async ({
    page,
  }) => {
    const actions = page.getByTestId("quick-actions");
    await actions.getByRole("link", { name: "پروفایل من" }).click();
    await expect(page).toHaveURL(/\/profile$/);

    await page.goBack();
    await actions.getByRole("link", { name: "بررسی هویت‌ها" }).click();
    await expect(page).toHaveURL(/\/identity-requests$/);

    await page.goBack();
    await actions.getByRole("link", { name: "کاربران" }).click();
    await expect(page).toHaveURL(/\/users$/);
  });

  test("pages the calendar by month", async ({ page }) => {
    const title = page.locator("[aria-live=polite]").first();
    const before = await title.textContent();
    await page.getByRole("button", { name: "ماه بعد" }).click();
    await expect(title).not.toHaveText(before ?? "");
    await page.getByRole("button", { name: "ماه قبل" }).click();
    await expect(title).toHaveText(before ?? "");
  });
});
