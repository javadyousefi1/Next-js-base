import { expect, test } from "@playwright/test";

import { signIn } from "./fixtures";

// 12 links are seeded (src/mocks/invite-links-data.ts): 9 unused (6 valid + 3 expired), 3 used.
test.describe("invite links", () => {
  test("the sidebar group expands and navigates to both pages", async ({ page }) => {
    await signIn(page, "/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: "مدیریت کاربران" }).click();
    await page.getByRole("link", { name: "لینک دعوت" }).click();
    await expect(page).toHaveURL(/\/invite-links$/);
    await expect(page.getByRole("heading", { name: "لینک‌های دعوت" })).toBeVisible();

    await page.getByRole("link", { name: "کاربران", exact: true }).click();
    await expect(page).toHaveURL(/\/users$/);
  });

  test.describe("page", () => {
    test.beforeEach(async ({ page }) => {
      await signIn(page, "/invite-links");
      await expect(page).toHaveURL(/\/invite-links$/);
    });

    test("lists the links with the total and has no search box", async ({ page }) => {
      await expect(page.getByRole("columnheader", { name: "نام کامل" })).toBeVisible();
      await expect(page.getByRole("cell", { name: "علی رضایی" })).toBeVisible();
      await expect(page.getByText("۱۲ نتیجه")).toBeVisible();
      await expect(page.getByRole("searchbox")).toHaveCount(0);
    });

    test("filters by usage in the drawer", async ({ page }) => {
      await page.getByRole("button", { name: "فیلترها", exact: true }).click();
      await page.getByRole("combobox", { name: "وضعیت استفاده" }).click();
      await page.getByRole("option", { name: "استفاده شده" }).click();
      await expect(page).toHaveURL(/isUsed=true/);
      await page.keyboard.press("Escape");
      await expect(page.getByText("۳ نتیجه")).toBeVisible();
      await expect(page.getByRole("cell", { name: "حسین کریمی" })).toBeVisible();
    });

    test("creates a link in the modal and shows it in the list", async ({ page }) => {
      await page.getByRole("button", { name: "ایجاد لینک دعوت" }).click();
      const dialog = page.getByRole("dialog");

      await dialog.getByRole("button", { name: "ایجاد لینک" }).click();
      await expect(dialog.getByText("نام را وارد کنید.")).toBeVisible();
      await expect(dialog.getByText("نام خانوادگی را وارد کنید.")).toBeVisible();
      await expect(dialog.getByText(/شماره موبایل معتبر نیست/)).toBeVisible();

      await dialog.getByRole("textbox", { name: "نام", exact: true }).fill("پوریا");
      await dialog.getByRole("textbox", { name: "نام خانوادگی" }).fill("آزادی");
      await dialog.getByRole("textbox", { name: "شماره موبایل" }).fill("۰۹۱۲۳۴۵۶۷۸۹");
      await dialog.getByRole("button", { name: "ایجاد لینک" }).click();

      await expect(dialog.getByTestId("created-invite-url")).toContainText(
        "http://localhost:3002/register?invite=",
      );
      await dialog.getByRole("button", { name: "بستن" }).first().click();
      await expect(dialog).toHaveCount(0);

      await expect(page.getByText("۱۳ نتیجه")).toBeVisible();
      await expect(page.getByRole("cell", { name: "پوریا آزادی" })).toBeVisible();
    });

    test("shows the server's reason when a valid link already exists", async ({ page }) => {
      await page.getByRole("button", { name: "ایجاد لینک دعوت" }).click();
      const dialog = page.getByRole("dialog");

      await dialog.getByRole("textbox", { name: "نام", exact: true }).fill("علی");
      await dialog.getByRole("textbox", { name: "نام خانوادگی" }).fill("رضایی");
      // The seeded valid link of the first row.
      await dialog.getByRole("textbox", { name: "شماره موبایل" }).fill("09130001000");
      await dialog.getByRole("button", { name: "ایجاد لینک" }).click();

      await expect(dialog.getByRole("alert")).toHaveText(
        "برای این شماره یک لینک دعوت فعال وجود دارد.",
      );
    });
  });
});
