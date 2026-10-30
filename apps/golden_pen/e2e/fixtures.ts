import { expect, type Page } from "@playwright/test";

/** Demo admin served by the MSW mock API (src/mocks/db.ts). */
export const DEMO_USER = { phoneNumber: "09120000000", password: "admin123" } as const;

/** The SMS code the mock API accepts for every phone number. */
export const OTP_CODE = "123456";

/** Signs in through the real password form (BFF → mocked upstream → httpOnly cookie). */
export async function signIn(page: Page, path = "/dashboard") {
  await page.goto(path);
  await expect(page).toHaveURL(/\/login/);
  await waitForHydration(page);
  await page.getByRole("textbox", { name: "شماره موبایل" }).fill(DEMO_USER.phoneNumber);
  await page.getByRole("textbox", { name: "رمز عبور" }).fill(DEMO_USER.password);
  await page.getByRole("button", { name: "ورود" }).click();
}

/**
 * Waits until React has hydrated the page's form. Filling a form before that races with
 * hydration (the values can be dropped), which only shows under load.
 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const form = document.querySelector("form");
    return form !== null && Object.keys(form).some((key) => key.startsWith("__reactProps"));
  });
}

/**
 * Registers a fresh user through the BFF and signs them in (the cookie lands in the page's
 * context), so a test can change data without touching the shared demo admin that other specs
 * read. The new user has no roles, so they are not a super-admin.
 */
export async function registerNewUser(page: Page) {
  const phoneNumber = `0912${String(Math.floor(Math.random() * 1e7)).padStart(7, "0")}`;
  const register = await page.request.post("/api/auth/register", {
    data: { firstName: "سارا", lastName: "محمدی", phoneNumber },
  });
  expect(register.ok()).toBe(true);
  const verify = await page.request.post("/api/auth/otp/verify", {
    data: { phoneNumber, code: OTP_CODE },
  });
  expect(verify.ok()).toBe(true);
}

/** `registerNewUser`, then opens a page that has a form (hydrated before the test goes on). */
export async function signInAsNewUser(page: Page, path = "/profile") {
  await registerNewUser(page);
  await page.goto(path);
  await expect(page).toHaveURL(new RegExp(`${path}$`));
  await waitForHydration(page);
}
