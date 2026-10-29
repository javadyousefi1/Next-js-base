import { expect, test } from "@playwright/test";

import { signIn } from "./fixtures";

// 27 users are seeded (src/mocks/users-data.ts), 10 per page.
test.describe("users table (URL state + React Query)", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, "/users");
    await expect(page).toHaveURL(/\/users$/);
  });

  test("lists the users with the total", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "نام کامل" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "علی رضایی" })).toBeVisible();
    await expect(page.getByText("۲۷ نتیجه")).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(11);
  });

  test("searches the full name and keeps it in the URL", async ({ page }) => {
    await page.getByRole("searchbox").fill("مریم");
    await expect(page).toHaveURL(/q=/);
    await expect(page.getByRole("cell", { name: "مریم احمدی" })).toBeVisible();
    await expect(page.getByText("۱ نتیجه")).toBeVisible();
  });

  test("filters by phone number in the drawer", async ({ page }) => {
    await page.getByRole("button", { name: "فیلترها", exact: true }).click();
    await page.getByRole("textbox", { name: "شماره موبایل" }).fill("09121007919");
    await expect(page).toHaveURL(/phoneNumber=09121007919/);
    await page.keyboard.press("Escape");
    await expect(page.getByText("۱ نتیجه")).toBeVisible();
    await expect(page.getByRole("cell", { name: "مریم احمدی" })).toBeVisible();
  });

  test("filters by role in the drawer", async ({ page }) => {
    await page.getByRole("button", { name: "فیلترها", exact: true }).click();
    await page.getByRole("combobox", { name: "نقش" }).click();
    await page.getByRole("option", { name: "کارآموز" }).click();
    await expect(page).toHaveURL(/role=intern/);
    await page.keyboard.press("Escape");
    await expect(page.getByText("۸ نتیجه")).toBeVisible();
  });

  test("filters by identity status in the drawer and resets", async ({ page }) => {
    await page.getByRole("button", { name: "فیلترها", exact: true }).click();
    await page.getByRole("combobox", { name: "وضعیت هویت" }).click();
    await page.getByRole("option", { name: "لغو شده" }).click();
    await expect(page).toHaveURL(/identityStatus=5/);
    await page.keyboard.press("Escape");
    await expect(page.getByText("۳ نتیجه")).toBeVisible();

    await page.getByRole("button", { name: "حذف فیلتر وضعیت هویت" }).click();
    await expect(page).not.toHaveURL(/identityStatus=/);
    await expect(page.getByText("۲۷ نتیجه")).toBeVisible();
  });

  test("shows a removable badge per active filter", async ({ page }) => {
    await page.getByRole("button", { name: "فیلترها", exact: true }).click();
    await page.getByRole("combobox", { name: "نقش" }).click();
    await page.getByRole("option", { name: "کارآموز" }).click();
    await expect(page).toHaveURL(/role=intern/);
    await page.keyboard.press("Escape");
    await expect(page.getByText("نقش: کارآموز")).toBeVisible();
    await expect(page.getByText("۸ نتیجه")).toBeVisible();

    await page.getByRole("button", { name: "حذف فیلتر نقش" }).click();
    await expect(page).not.toHaveURL(/role=/);
    await expect(page.getByText("۲۷ نتیجه")).toBeVisible();
    await expect(page.getByRole("row")).toHaveCount(11);
  });

  test("shows the no-results state and resets from it", async ({ page }) => {
    await page.getByRole("searchbox").fill("zzzzنامعتبر");
    await expect(page.getByText("نتیجه‌ای پیدا نشد")).toBeVisible();
    await expect(page.getByText("جستجو: zzzzنامعتبر")).toBeVisible();

    await page.getByRole("button", { name: "پاک کردن فیلترها" }).click();
    await expect(page).not.toHaveURL(/q=/);
    await expect(page.getByText("نتیجه‌ای پیدا نشد")).toHaveCount(0);
    await expect(page.getByText("۲۷ نتیجه")).toBeVisible();
    await expect(page.getByRole("searchbox")).toHaveValue("");
  });

  test("paginates on the server", async ({ page }) => {
    await page.getByRole("button", { name: "صفحه بعد" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText("صفحه 2 از 3")).toBeVisible();
  });
});
