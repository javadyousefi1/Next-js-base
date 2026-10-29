import { expect, test, type Page } from "@playwright/test";

import { OTP_CODE, signIn, waitForHydration } from "./fixtures";

/** A 1x1 PNG. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==",
  "base64",
);

/**
 * Registers a fresh user through the BFF and signs them in (the cookie lands in the page's
 * context), so a test can edit the profile without touching the shared demo admin that other
 * specs read (e.g. the welcome card).
 */
async function signInAsNewUser(page: Page) {
  const phoneNumber = `0912${String(Math.floor(Math.random() * 1e7)).padStart(7, "0")}`;
  const register = await page.request.post("/api/auth/register", {
    data: { firstName: "سارا", lastName: "محمدی", phoneNumber },
  });
  expect(register.ok()).toBe(true);
  const verify = await page.request.post("/api/auth/otp/verify", {
    data: { phoneNumber, code: OTP_CODE },
  });
  expect(verify.ok()).toBe(true);

  await page.goto("/profile");
  await expect(page).toHaveURL(/\/profile$/);
  await waitForHydration(page);
}

test.describe("profile", () => {
  test("opens from the user menu and shows the identity of the demo admin", async ({ page }) => {
    await signIn(page, "/");
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole("button", { name: "حساب کاربری" }).click();
    await page.getByRole("menuitem", { name: "پروفایل" }).click();
    await expect(page).toHaveURL(/\/profile$/);
    await expect(page.getByRole("heading", { name: "پروفایل", level: 1 })).toBeVisible();

    await expect(page.getByTestId("identity-status")).toHaveText("رد شده");
    await expect(page.getByText("تصویر پروانه خوانا نیست.")).toBeVisible();
    await expect(page.getByRole("link", { name: "پروانه.pdf" })).toHaveAttribute(
      "href",
      "https://example.com/license.pdf",
    );
    await expect(page.getByRole("link", { name: "قرارداد.pdf" })).toBeVisible();
  });

  test("edits the basic info: toast and the sidebar name", async ({ page }) => {
    await signInAsNewUser(page);
    const save = page.getByRole("button", { name: "ذخیره تغییرات" }).first();
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
    await page.getByRole("button", { name: "ذخیره تغییرات" }).first().click();
    await expect(page.getByText("ایمیل معتبر نیست.")).toBeVisible();

    await page.getByRole("textbox", { name: "کد ملی" }).fill("۱۲۳");
    await page.getByRole("button", { name: "ذخیره تغییرات" }).last().click();
    await expect(page.getByText("کد ملی باید ۱۰ رقم باشد.")).toBeVisible();
  });

  test("saves the identity: the cities follow the province", async ({ page }) => {
    await signInAsNewUser(page);
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
    await page.getByRole("button", { name: "ذخیره تغییرات" }).last().click();
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
    await expect(page.getByTestId("license-list")).toHaveCount(0);

    await page
      .getByTestId("license-input")
      .setInputFiles({ name: "license-scan.png", mimeType: "image/png", buffer: PNG });
    await expect(
      page.getByTestId("license-list").getByRole("link", { name: "license-scan.png" }),
    ).toBeVisible();
    await expect(page.getByTestId("document-list")).toHaveCount(0);
  });
});
