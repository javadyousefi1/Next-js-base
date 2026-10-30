import { expect, test } from "@playwright/test";

import { DEMO_USER, waitForHydration } from "./fixtures";

test("public landing leads through login to the protected dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ذهن شما برای دفاع.");
  await page.getByRole("link", { name: "ورود به گلدن پن", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await waitForHydration(page);
  await page.getByRole("textbox", { name: "شماره موبایل" }).fill(DEMO_USER.phoneNumber);
  await page.getByRole("textbox", { name: "رمز عبور" }).fill(DEMO_USER.password);
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId("greeting")).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ذهن شما برای دفاع.");
  await page.getByRole("link", { name: "ورود به پنل", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

for (const width of [360, 768, 1440]) {
  test(`landing navigation and FAQ work at ${width}px without horizontal overflow`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page
      .getByRole("navigation", { name: "راهبری صفحه" })
      .getByRole("link", { name: "اشتراک‌ها" })
      .click();
    await expect(page).toHaveURL(/#plans$/);
    await expect(
      page.getByRole("heading", { name: "متناسب با اندازهٔ کارتان انتخاب کنید." }),
    ).toBeInViewport();
    await page.getByText("آیا هوش مصنوعی جایگزین نظر وکیل است؟", { exact: false }).click();
    await expect(page.getByText(/خیر. ابزارهای هوشمند برای تحقیق/)).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.getByRole("link", { name: "بازگشت به بالا" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    const heroCopy = page.getByText(
      "از اولین گفت‌وگو با موکل تا آمادگی برای دادگاه؛ پرونده، سند و جلسه را کنار هم پیش ببرید، با هوشمندی‌ای که در تمام مسیر همراه شماست.",
      { exact: true },
    );
    const copyBox = await heroCopy.boundingBox();
    expect(copyBox).not.toBeNull();
    expect(copyBox!.x).toBeGreaterThanOrEqual(0);
    expect(copyBox!.x + copyBox!.width).toBeLessThanOrEqual(width);
    await page.screenshot({ path: testInfo.outputPath(`landing-${width}.png`), fullPage: true });
    await page.screenshot({ path: testInfo.outputPath(`landing-hero-${width}.png`) });
  });
}
