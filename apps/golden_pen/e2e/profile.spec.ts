import { expect, test, type Page } from "@playwright/test";

import { signIn, signInAsNewUser, waitForHydration } from "./fixtures";

/** A 1x1 PNG. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64",
);

async function openTab(page: Page, name: string) {
  await page.getByRole("tab", { name, exact: true }).click();
  await expect(page.getByRole("tabpanel", { name, exact: true })).toBeVisible();
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
}

test.describe("profile", () => {
  test("opens from the user menu and shows the identity of the demo admin", async ({ page }) => {
    await signIn(page, "/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: "حساب کاربری" }).click();
    await page.getByRole("menuitem", { name: "پروفایل" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "پروفایل", level: 1 })).toBeVisible();

    await expect(page.getByTestId("identity-status")).toHaveText("رد شده");
    await expect(page.getByRole("tab", { name: "اطلاعات پایه" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await openTab(page, "اطلاعات هویتی");
    await expect(page).toHaveURL(/\/profile\?tab=identity$/);
    await expect(page.getByText("تصویر پروانه خوانا نیست.", { exact: true })).toBeVisible();

    await openTab(page, "مدارک");
    await expect(page.getByRole("link", { name: "پروانه.pdf" })).toHaveAttribute(
      "href",
      "https://example.com/license.pdf",
    );
    await expect(page.getByRole("link", { name: "قرارداد.pdf" })).toBeVisible();
  });

  test("edits the basic info: toast and the sidebar name", async ({ page }) => {
    await signInAsNewUser(page);
    const save = page.getByRole("button", { name: "ذخیره تغییرات" });
    await expect(save).toBeDisabled();

    await page.getByRole("textbox", { name: "نام", exact: true }).fill("نگار");
    await expect(save).toBeEnabled();
    await save.click();

    await expect(page.getByText("اطلاعات ذخیره شد")).toBeVisible();
    await expect(save).toBeDisabled();
    await expect(page.getByRole("button", { name: "حساب کاربری" })).toContainText("نگار محمدی");
  });

  test("validates the email and the national id", async ({ page }) => {
    await signInAsNewUser(page);

    await page.getByRole("textbox", { name: "ایمیل" }).fill("not-an-email");
    await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await expect(page.getByText("ایمیل معتبر نیست.")).toBeVisible();

    await openTab(page, "اطلاعات هویتی");
    await page.getByRole("textbox", { name: "کد ملی" }).fill("۱۲۳");
    await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await expect(page.getByText("کد ملی باید ۱۰ رقم باشد.")).toBeVisible();
  });

  test("saves the identity: the cities follow the province", async ({ page }) => {
    await signInAsNewUser(page);
    await openTab(page, "اطلاعات هویتی");
    const city = page.getByRole("combobox", { name: "شهر" });
    await expect(city).toBeDisabled();

    await page.getByRole("combobox", { name: "استان" }).click();
    await page.getByRole("option", { name: "اصفهان" }).click();
    await expect(city).toBeEnabled();
    await city.click();
    await expect(page.getByRole("option", { name: "کاشان" })).toBeVisible();
    await expect(page.getByRole("option", { name: "شیراز" })).toHaveCount(0);
    await page.getByRole("option", { name: "کاشان" }).click();

    await page.getByRole("textbox", { name: "تخصص" }).fill("حقوق کیفری");
    await page.getByRole("textbox", { name: "کد ملی" }).fill("۰۰۱۲۳۴۵۶۷۸");
    await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await expect(page.getByText("اطلاعات هویتی ذخیره شد")).toBeVisible();

    await page.reload();
    await waitForHydration(page);
    await expect(page.getByRole("textbox", { name: "تخصص" })).toHaveValue("حقوق کیفری");
    await expect(page.getByRole("textbox", { name: "کد ملی" })).toHaveValue("0012345678");
    await expect(page.getByRole("combobox", { name: "استان" })).toContainText("اصفهان");
    await expect(page.getByRole("combobox", { name: "شهر" })).toContainText("کاشان");
  });

  test("uploads and removes the avatar", async ({ page }) => {
    await signInAsNewUser(page);
    const avatar = page.getByTestId("profile-avatar");
    await expect(page.getByRole("button", { name: "حذف تصویر" })).toHaveCount(0);

    await page
      .getByTestId("avatar-input")
      .setInputFiles({ name: "me.png", mimeType: "image/png", buffer: PNG });
    await expect(avatar.locator("img")).toHaveAttribute("src", /^data:image\/png;base64,/);

    await page.getByRole("button", { name: "حذف تصویر" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "حذف تصویر" }).click();
    await expect(avatar.locator("img")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "حذف تصویر" })).toHaveCount(0);
  });

  test("rejects a wrong avatar file type in the browser", async ({ page }) => {
    await signInAsNewUser(page);

    await page.getByTestId("avatar-input").setInputFiles({
      name: "a.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("%PDF-1.4"),
    });
    await expect(page.getByText("نوع فایل پشتیبانی نمی‌شود.")).toBeVisible();
  });

  test("uploads a document into the list", async ({ page }) => {
    await signInAsNewUser(page);
    await openTab(page, "مدارک");
    await expect(page.getByTestId("license-list")).toHaveCount(0);

    await page
      .getByTestId("license-input")
      .setInputFiles({ name: "license-scan.png", mimeType: "image/png", buffer: PNG });
    await expect(
      page.getByTestId("license-list").getByRole("link", { name: "license-scan.png" }),
    ).toBeVisible();
    await expect(page.getByTestId("document-list")).toHaveCount(0);
  });

  test("rejects a wrong document type and a second file in the dropzone", async ({ page }) => {
    await signInAsNewUser(page);
    await openTab(page, "مدارک");

    await page
      .getByTestId("document-input")
      .setInputFiles({ name: "a.zip", mimeType: "application/zip", buffer: Buffer.from("zip") });
    await expect(page.getByText("نوع فایل پشتیبانی نمی‌شود.")).toBeVisible();
    await expect(page.getByTestId("document-list")).toHaveCount(0);
  });

  test("requests identity verification: incomplete first, then complete", async ({ page }) => {
    await signInAsNewUser(page);
    await openTab(page, "اطلاعات هویتی");
    const request = page.getByRole("button", { name: "درخواست احراز هویت" });
    await expect(request).toBeEnabled();

    // An empty profile: the backend answers ProfileNotComplete.
    await request.click();
    await expect(page.getByText("ابتدا اطلاعات هویتی و مدارک را کامل کنید")).toBeVisible();

    await page.getByRole("textbox", { name: "تخصص" }).fill("حقوق کیفری");
    await page.getByRole("textbox", { name: "کد ملی" }).fill("۰۰۱۲۳۴۵۶۷۸");
    await page.getByRole("button", { name: "ذخیره تغییرات" }).click();
    await expect(page.getByText("اطلاعات هویتی ذخیره شد")).toBeVisible();
    await openTab(page, "مدارک");
    await page
      .getByTestId("license-input")
      .setInputFiles({ name: "license-scan.png", mimeType: "image/png", buffer: PNG });
    await expect(page.getByTestId("license-list")).toBeVisible();

    await openTab(page, "اطلاعات هویتی");
    await request.click();
    await expect(page.getByText("درخواست احراز هویت ثبت شد")).toBeVisible();
    await expect(page.getByRole("button", { name: "درخواست شما در حال بررسی است" })).toBeDisabled();
    await expect(page.getByTestId("identity-status")).toHaveText("درخواست شده");
  });
});
