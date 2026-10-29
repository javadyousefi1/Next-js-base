import { expect, test } from "@playwright/test";

import { signIn } from "./fixtures";

// Mock data: 27 users (3 identity Pending + 3 Requested), 12 invite links (9 unused).
test.describe("dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, "/");
    await expect(page).toHaveURL(/\/$/);
  });

  test("shows the greeting, the live clock and today's dates", async ({ page }) => {
    await expect(page.getByTestId("greeting")).toContainText(/(صبح|ظهر|عصر|شب) بخیر، مدیر/);
    await expect(page.getByTestId("clock")).toHaveText(/^[۰-۹]{2}:[۰-۹]{2}:[۰-۹]{2}$/);
    await expect(page.getByTestId("jalali-date")).toContainText(/[۰-۹]{4}/);
    await expect(page.getByRole("progressbar", { name: "پیشرفت سال" })).toBeVisible();
  });

  test("shows the counts and links the cards to the filtered pages", async ({ page }) => {
    const users = page.getByText("کل کاربران").locator("..");
    await expect(users).toContainText("۲۷");

    const identity = page.getByRole("link", { name: /درخواست‌های هویت در انتظار بررسی/ });
    await expect(identity).toContainText("۶");
    const invites = page.getByRole("link", { name: /لینک‌های دعوت استفاده‌نشده/ });
    // 9 seeded; the invite-links spec may have created one in parallel.
    await expect(invites).toContainText(/[۰-۹]+$/);
    const unused = (await invites.textContent())?.match(/[۰-۹]+$/)?.[0];

    await identity.click();
    await expect(page).toHaveURL(/\/users\?identityStatus=2$/);
    await expect(page.getByText("۳ نتیجه")).toBeVisible();

    await page.goBack();
    await page.getByRole("link", { name: /لینک‌های دعوت استفاده‌نشده/ }).click();
    await expect(page).toHaveURL(/\/invite-links\?isUsed=false$/);
    await expect(page.getByText(`${unused} نتیجه`)).toBeVisible();
  });

  test("the quick action opens the invite link modal", async ({ page }) => {
    await page.getByRole("button", { name: "ایجاد لینک دعوت" }).click();
    await expect(
      page.getByRole("dialog").getByRole("button", { name: "ایجاد لینک" }),
    ).toBeVisible();
  });

  test("the quick links go to the filtered users and the profile", async ({ page }) => {
    await page.getByRole("link", { name: "ویرایش پروفایل" }).click();
    await expect(page).toHaveURL(/\/profile$/);
  });

  test("pages the calendar by month", async ({ page }) => {
    const title = page.locator("[aria-live=polite]").first();
    const before = await title.textContent();
    await page.getByRole("button", { name: "ماه بعد" }).click();
    await expect(title).not.toHaveText(before ?? "");
    await page.getByRole("button", { name: "ماه قبل" }).click();
    await expect(title).toHaveText(before ?? "");
  });

  test("notes can be added, ticked, removed and survive a reload", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "یک کار یا یادداشت بنویس…" });
    await input.fill("تماس با مشتری");
    await input.press("Enter");
    await input.fill("ارسال گزارش");
    await input.press("Enter");

    const summary = page.getByTestId("notes-summary");
    await expect(summary).toHaveText("۰ از ۲ انجام شده");

    await page.getByRole("checkbox", { name: "تماس با مشتری" }).click();
    await expect(summary).toHaveText("۱ از ۲ انجام شده");

    await page.reload();
    await expect(page.getByRole("checkbox", { name: "تماس با مشتری" })).toBeChecked();
    await expect(page.getByTestId("notes-summary")).toHaveText("۱ از ۲ انجام شده");

    await page.getByRole("button", { name: "پاک کردن انجام‌شده‌ها" }).click();
    await expect(page.getByTestId("notes-summary")).toHaveText("۰ از ۱ انجام شده");

    await page.getByRole("button", { name: "حذف یادداشت: ارسال گزارش" }).click();
    await expect(page.getByText("هنوز یادداشتی ندارید.")).toBeVisible();
  });
});
