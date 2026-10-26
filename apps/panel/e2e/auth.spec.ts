import { expect, test } from "@playwright/test";

import { DEMO_USER, OTP_CODE, signIn } from "./fixtures";

test.describe("authentication (phone number, BFF + httpOnly cookie)", () => {
  test("protected pages redirect to login with a callback URL", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fsettings$/);
    await expect(page.getByRole("heading", { name: "ورود" })).toBeVisible();
  });

  test("the only language is Persian, without a locale prefix", async ({ page }) => {
    await page.goto("/fa/login");
    await expect(page).toHaveURL(/\/login$/);
    expect(new URL(page.url()).pathname).toBe("/login");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "fa-IR");
  });

  test("validates the form with the shared zod schema", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "ورود" }).click();
    await expect(page.getByText("شماره موبایل معتبر وارد کنید، مثل 09123456789.")).toBeVisible();
    await expect(page.getByText("رمز عبور را وارد کنید.")).toBeVisible();
  });

  test("rejects a wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("textbox", { name: "شماره موبایل" }).fill(DEMO_USER.phoneNumber);
    await page.getByRole("textbox", { name: "رمز عبور" }).fill("wrong-password");
    await page.getByRole("button", { name: "ورود" }).click();
    await expect(page.getByText("شماره موبایل یا رمز عبور اشتباه است.")).toBeVisible();
  });

  test("signs in with a password, sees the name, and signs out", async ({ page, context }) => {
    await signIn(page, "/");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("مدیر سیستم، خوش آمدید")).toBeVisible();

    // The token is httpOnly: invisible to JavaScript.
    const cookies = await context.cookies();
    expect(cookies.find((cookie) => cookie.name === "access_token")?.httpOnly).toBe(true);
    expect(await page.evaluate(() => document.cookie)).not.toContain("access_token");

    await page.getByRole("button", { name: "حساب کاربری" }).click();
    await page.getByRole("menuitem", { name: "خروج" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signs in with an SMS code", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("tab", { name: "کد پیامکی" }).click();
    await page.getByRole("textbox", { name: "شماره موبایل" }).fill(DEMO_USER.phoneNumber);
    await page.getByRole("button", { name: "ارسال کد" }).click();

    await expect(page.getByRole("textbox", { name: "کد تأیید" })).toBeVisible();
    await page.getByRole("textbox", { name: "کد تأیید" }).fill(OTP_CODE);
    await page.getByRole("button", { name: "تأیید و ورود" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("مدیر سیستم، خوش آمدید")).toBeVisible();
  });

  test("rejects a wrong SMS code and an unknown number", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("tab", { name: "کد پیامکی" }).click();
    await page.getByRole("textbox", { name: "شماره موبایل" }).fill("09129999999");
    await page.getByRole("button", { name: "ارسال کد" }).click();
    await expect(page.getByText("حسابی با این شماره موبایل وجود ندارد.")).toBeVisible();

    await page.getByRole("textbox", { name: "شماره موبایل" }).fill(DEMO_USER.phoneNumber);
    await page.getByRole("button", { name: "ارسال کد" }).click();
    await page.getByRole("textbox", { name: "کد تأیید" }).fill("111111");
    await page.getByRole("button", { name: "تأیید و ورود" }).click();
    await expect(page.getByText("کد واردشده اشتباه است یا منقضی شده است.")).toBeVisible();
  });

  test("registers a new number, confirms the code and lands signed in", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "ثبت‌نام" }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: "ایجاد حساب" })).toBeVisible();

    await page.getByRole("textbox", { name: "نام", exact: true }).fill("سارا");
    await page.getByRole("textbox", { name: "نام خانوادگی" }).fill("احمدی");
    // The mock DB lives as long as the server: a fresh number per run keeps reruns green.
    const phoneNumber = `0935${String(Date.now()).slice(-7)}`;
    await page.getByRole("textbox", { name: "شماره موبایل" }).fill(phoneNumber);
    await page.getByRole("button", { name: "ایجاد حساب" }).click();

    await page.getByRole("textbox", { name: "کد تأیید" }).fill(OTP_CODE);
    await page.getByRole("button", { name: "تأیید و ورود" }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText("سارا احمدی، خوش آمدید")).toBeVisible();
  });

  test("a registered number cannot register again", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("textbox", { name: "نام", exact: true }).fill("مدیر");
    await page.getByRole("textbox", { name: "نام خانوادگی" }).fill("تکراری");
    await page.getByRole("textbox", { name: "شماره موبایل" }).fill(DEMO_USER.phoneNumber);
    await page.getByRole("button", { name: "ایجاد حساب" }).click();
    await expect(page.getByText("این شماره موبایل قبلاً ثبت‌نام کرده است.")).toBeVisible();
  });

  test("a request without a session sends the user back to login", async ({ page, context }) => {
    await signIn(page, "/settings");
    await expect(page).toHaveURL(/\/settings$/);

    // No cookie → the proxy sends the next page request back to login.
    await context.clearCookies();
    await page.reload();
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fsettings$/);
  });
});
