import { expect, type Page } from "@playwright/test";

/** Demo admin served by the MSW mock API (src/mocks/db.ts). */
export const DEMO_USER = { phoneNumber: "09120000000", password: "admin123" } as const;

/** The SMS code the mock API accepts for every phone number. */
export const OTP_CODE = "123456";

/** Signs in through the real password form (BFF → mocked upstream → httpOnly cookie). */
export async function signIn(page: Page, path = "/") {
  await page.goto(path);
  await expect(page).toHaveURL(/\/login/);
  await page.getByRole("textbox", { name: "شماره موبایل" }).fill(DEMO_USER.phoneNumber);
  await page.getByRole("textbox", { name: "رمز عبور" }).fill(DEMO_USER.password);
  await page.getByRole("button", { name: "ورود" }).click();
}
