import { expect, type Page } from "@playwright/test";

/** Demo account served by the MSW mock API (src/mocks/db.ts). */
export const DEMO_USER = { username: "admin", password: "admin123" } as const;

/** Signs in through the real login form (BFF → mocked upstream → httpOnly cookies). */
export async function signIn(page: Page, path = "/en") {
  await page.goto(path);
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("Username").fill(DEMO_USER.username);
  await page.getByLabel("Password").fill(DEMO_USER.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}
