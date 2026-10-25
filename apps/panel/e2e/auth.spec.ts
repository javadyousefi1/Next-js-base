import { expect, test } from "@playwright/test";

import { DEMO_USER, OTP_CODE, signIn } from "./fixtures";

test.describe("authentication (phone number, BFF + httpOnly cookie)", () => {
  test("protected pages redirect to login with a callback URL", async ({ page }) => {
    await page.goto("/en/settings");
    await expect(page).toHaveURL(/\/en\/login\?callbackUrl=%2Fsettings$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test.describe("a browser language we don't ship", () => {
    // next-intl follows `Accept-Language`; an unknown language falls back to the default (fa).
    test.use({ locale: "de-DE" });

    test("gets the default language, Persian", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/fa\/login/);
    });
  });

  test("validates the form with the shared zod schema", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Enter a valid mobile number, like 09123456789.")).toBeVisible();
    await expect(page.getByText("Password is required.")).toBeVisible();
  });

  test("rejects a wrong password", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("textbox", { name: "Phone number" }).fill(DEMO_USER.phoneNumber);
    await page.getByRole("textbox", { name: "Password" }).fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid phone number or password.")).toBeVisible();
  });

  test("signs in with a password, sees the name, and signs out", async ({ page, context }) => {
    await signIn(page, "/en");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByText("Welcome, مدیر سیستم")).toBeVisible();

    // The token is httpOnly: invisible to JavaScript.
    const cookies = await context.cookies();
    expect(cookies.find((cookie) => cookie.name === "access_token")?.httpOnly).toBe(true);
    expect(await page.evaluate(() => document.cookie)).not.toContain("access_token");

    await page.getByRole("button", { name: "Account" }).click();
    await page.getByRole("menuitem", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/en\/login$/);
  });

  test("signs in with an SMS code", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("tab", { name: "SMS code" }).click();
    await page.getByRole("textbox", { name: "Phone number" }).fill(DEMO_USER.phoneNumber);
    await page.getByRole("button", { name: "Send code" }).click();

    await expect(page.getByRole("textbox", { name: "Verification code" })).toBeVisible();
    await page.getByRole("textbox", { name: "Verification code" }).fill(OTP_CODE);
    await page.getByRole("button", { name: "Verify and sign in" }).click();

    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByText("Welcome, مدیر سیستم")).toBeVisible();
  });

  test("rejects a wrong SMS code and an unknown number", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("tab", { name: "SMS code" }).click();
    await page.getByRole("textbox", { name: "Phone number" }).fill("09129999999");
    await page.getByRole("button", { name: "Send code" }).click();
    await expect(page.getByText("No account exists with this phone number.")).toBeVisible();

    await page.getByRole("textbox", { name: "Phone number" }).fill(DEMO_USER.phoneNumber);
    await page.getByRole("button", { name: "Send code" }).click();
    await page.getByRole("textbox", { name: "Verification code" }).fill("111111");
    await page.getByRole("button", { name: "Verify and sign in" }).click();
    await expect(page.getByText("The code is wrong or has expired.")).toBeVisible();
  });

  test("registers a new number, confirms the code and lands signed in", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByRole("link", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/en\/register$/);
    await expect(page.getByRole("heading", { name: "Create an account" })).toBeVisible();

    await page.getByRole("textbox", { name: "First name" }).fill("Sara");
    await page.getByRole("textbox", { name: "Last name" }).fill("Ahmadi");
    // The mock DB lives as long as the server: a fresh number per run keeps reruns green.
    const phoneNumber = `0935${String(Date.now()).slice(-7)}`;
    await page.getByRole("textbox", { name: "Phone number" }).fill(phoneNumber);
    await page.getByRole("button", { name: "Create account" }).click();

    await page.getByRole("textbox", { name: "Verification code" }).fill(OTP_CODE);
    await page.getByRole("button", { name: "Verify and sign in" }).click();

    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByText("Welcome, Sara Ahmadi")).toBeVisible();
  });

  test("a registered number cannot register again", async ({ page }) => {
    await page.goto("/en/register");
    await page.getByRole("textbox", { name: "First name" }).fill("Admin");
    await page.getByRole("textbox", { name: "Last name" }).fill("Again");
    await page.getByRole("textbox", { name: "Phone number" }).fill(DEMO_USER.phoneNumber);
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("This phone number is already registered.")).toBeVisible();
  });

  test("a request without a session sends the user back to login", async ({ page, context }) => {
    await signIn(page, "/en/settings");
    await expect(page).toHaveURL(/\/en\/settings$/);

    // No cookie → the proxy sends the next page request back to login.
    await context.clearCookies();
    await page.reload();
    await expect(page).toHaveURL(/\/en\/login\?callbackUrl=%2Fsettings$/);
  });
});
