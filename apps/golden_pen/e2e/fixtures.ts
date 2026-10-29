import { expect, type Page } from "@playwright/test";

/** Demo admin served by the MSW mock API (src/mocks/db.ts). */
export const DEMO_USER = { phoneNumber: "09120000000", password: "admin123" } as const;

/** The SMS code the mock API accepts for every phone number. */
export const OTP_CODE = "123456";

/** Signs in through the real password form (BFF → mocked upstream → httpOnly cookie). */
export async function signIn(page: Page, path = "/") {
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
