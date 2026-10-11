import { expect, test } from "@playwright/test";

import { signIn } from "./fixtures";

// "Today" in the browser is 2024-03-20 = Wednesday 1 Farvardin 1403.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2024-03-20T08:00:00Z"));
  await signIn(page, "/en/calendar");
  await expect(page.getByRole("heading", { name: "Calendar", level: 1 })).toBeVisible();
});

test("the calendar selects a day by click and with the keyboard", async ({ page }) => {
  const grid = page.getByRole("grid", { name: "Farvardin 1403" });
  const today = grid.getByRole("button", { name: "Wednesday 1 Farvardin 1403" });
  await expect(today).toHaveAttribute("aria-current", "date");

  await today.click();
  await expect(page.getByText("Wednesday, March 20, 2024")).toBeVisible();

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Thursday 2 Farvardin 1403")).toBeVisible();
  await expect(page.getByText("Thursday, March 21, 2024")).toBeVisible();
});

test("the Today button selects today and brings its month back into view", async ({ page }) => {
  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.getByRole("grid", { name: "Ordibehesht 1403" })).toBeVisible();

  await page.getByRole("button", { name: "Today" }).click();
  await expect(page.getByRole("grid", { name: "Farvardin 1403" })).toBeVisible();
  await expect(page.getByText("Wednesday 1 Farvardin 1403")).toBeVisible();
});

test("the date picker jumps with the month list, picks a day and closes", async ({ page }) => {
  const trigger = page.getByLabel("Date", { exact: true });
  await expect(trigger).toHaveText("Pick a date");

  await trigger.click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Month", { exact: true }).selectOption("7");
  await dialog.getByRole("button", { name: "Sunday 1 Mehr 1403" }).click();

  await expect(dialog).toBeHidden();
  await expect(trigger).toHaveText("1 Mehr 1403");
  await expect(page.getByText("Sunday, September 22, 2024")).toBeVisible();
});

test("the range picker reports the range only after the second day", async ({ page }) => {
  const trigger = page.getByLabel("Range", { exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog");

  await dialog.getByRole("button", { name: "Sunday 5 Farvardin 1403" }).click();
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveText("Pick a date range");

  await dialog.getByRole("button", { name: "Sunday 12 Farvardin 1403" }).click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toHaveText("5 Farvardin 1403 – 12 Farvardin 1403");
  await expect(page.getByText("8 days")).toBeVisible();
});

test("Persian: Persian digits, and the left arrow moves to the next day (RTL)", async ({
  page,
}) => {
  await page.goto("/fa/calendar");
  const today = page
    .getByRole("grid", { name: "فروردین ۱۴۰۳" })
    .getByRole("button", { name: "چهارشنبه ۱ فروردین ۱۴۰۳" });
  await expect(today).toHaveAttribute("aria-current", "date");

  await today.click();
  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Enter");
  await expect(page.getByText("پنجشنبه ۲ فروردین ۱۴۰۳")).toBeVisible();
});
