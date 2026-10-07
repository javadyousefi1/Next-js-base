import { expect, type Page } from "@playwright/test";

type Account = { username: string; password: string };

/** Demo admin served by the MSW mock API (src/mocks/db.ts): every permission. */
export const DEMO_USER = { username: "admin", password: "admin123" } as const;

/** Demo member (role `user`): signed in, but no users access. */
export const MEMBER_USER = { username: "member", password: "member123" } as const;

/** Signs in through the real login form (BFF → mocked upstream → httpOnly cookies). */
export async function signIn(page: Page, path = "/en", user: Account = DEMO_USER) {
  await page.goto(path);
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel("Username").fill(user.username);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Sign in" }).click();
}
