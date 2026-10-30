import { expect, test, type Page } from "@playwright/test";

import { registerNewUser, signIn } from "./fixtures";

// Seeded users (src/mocks/users-data.ts): 6 Requested, 6 Verified, 3 Rejected, 3 Revoked.
// Specs run in parallel on one mock server, so each test that changes a status uses its OWN user
// and never asserts a tab's total.
const row = (page: Page, name: string) => page.getByRole("row").filter({ hasText: name });

test.describe("identity requests", () => {
  test("the sidebar group leads to the page, which lists only requested identities", async ({
    page,
  }) => {
    await signIn(page, "/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: "مدیریت کاربران" }).click();
    await page.getByRole("link", { name: "احراز هویت" }).click();
    await expect(page).toHaveURL(/\/identity-requests$/);
    await expect(page.getByRole("heading", { name: "درخواست‌های احراز هویت" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "در انتظار بررسی" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await expect(page.getByRole("cell", { name: "حسین کریمی" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "درخواست شده", exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByRole("cell", { name: "تأیید شده", exact: true })).toHaveCount(0);
    await expect(page.getByRole("cell", { name: "رد شده", exact: true })).toHaveCount(0);
  });

  test("switching tabs updates the URL and the rows", async ({ page }) => {
    await signIn(page, "/identity-requests");
    await expect(page).toHaveURL(/\/identity-requests$/);

    await page.getByRole("tab", { name: "تأیید شده" }).click();
    await expect(page).toHaveURL(/\/identity-requests\?status=verified$/);
    await expect(page.getByRole("cell", { name: "مریم احمدی" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "حسین کریمی" })).toHaveCount(0);

    await page.getByRole("tab", { name: "همه" }).click();
    await expect(page).toHaveURL(/status=all/);
    await expect(page.getByRole("cell", { name: "حسین کریمی" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "مریم احمدی" })).toBeVisible();

    await page.getByRole("tab", { name: "در انتظار بررسی" }).click();
    await expect(page).not.toHaveURL(/status=/);
  });

  test("searches the full name and filters the phone number in the drawer", async ({ page }) => {
    await signIn(page, "/identity-requests?status=all");
    await expect(page).toHaveURL(/status=all/);

    await page.getByRole("searchbox").fill("مریم");
    await expect(page).toHaveURL(/q=/);
    await expect(page.getByText("۱ نتیجه")).toBeVisible();

    await page.getByRole("button", { name: "فیلترها", exact: true }).click();
    await page.getByRole("textbox", { name: "شماره موبایل" }).fill("09121007919");
    await expect(page).toHaveURL(/phoneNumber=09121007919/);
    await page.keyboard.press("Escape");
    await expect(page.getByText("۱ نتیجه")).toBeVisible();
    await expect(page.getByRole("cell", { name: "مریم احمدی" })).toBeVisible();
  });

  test("verifies a requested identity after a confirmation", async ({ page }) => {
    await signIn(page, "/identity-requests");
    await expect(page).toHaveURL(/\/identity-requests$/);
    const target = row(page, "یاسر طاهری");

    await target.getByRole("button", { name: "تأیید" }).click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog.getByText("تأیید احراز هویت یاسر طاهری؟")).toBeVisible();
    await dialog.getByRole("button", { name: "تأیید" }).click();

    await expect(page.getByText("احراز هویت یاسر طاهری تأیید شد")).toBeVisible();
    await expect(target).toHaveCount(0);
  });

  test("rejects with a reason: validation first, then a quick-pick chip", async ({ page }) => {
    await signIn(page, "/identity-requests");
    await expect(page).toHaveURL(/\/identity-requests$/);
    const target = row(page, "محمد حسینی");

    await target.getByRole("button", { name: "رد", exact: true }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "رد درخواست" }).click();
    await expect(dialog.getByText("دلیل باید دست‌کم ۳ نویسه باشد.")).toBeVisible();

    await dialog.getByRole("button", { name: "اطلاعات ناقص است" }).click();
    await expect(dialog.getByRole("textbox", { name: "دلیل" })).toHaveValue("اطلاعات ناقص است");
    await dialog.getByRole("button", { name: "رد درخواست" }).click();

    await expect(page.getByText("احراز هویت محمد حسینی رد شد")).toBeVisible();
    await expect(target).toHaveCount(0);

    await page.getByRole("tab", { name: "رد شده" }).click();
    await expect(row(page, "محمد حسینی")).toContainText("اطلاعات ناقص است");
  });

  test("revokes a verified identity with a reason", async ({ page }) => {
    await signIn(page, "/identity-requests?status=verified");
    await expect(page).toHaveURL(/status=verified/);
    const target = row(page, "امیر قاسمی");

    await expect(target.getByRole("button", { name: "تأیید" })).toHaveCount(0);
    await target.getByRole("button", { name: "ابطال" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: "مدارک جعلی است" }).click();
    await dialog.getByRole("button", { name: "ابطال احراز هویت" }).click();

    await expect(page.getByText("احراز هویت امیر قاسمی باطل شد")).toBeVisible();
    await expect(target).toHaveCount(0);
  });

  test("shows the server's reason when the request is no longer waiting", async ({ page }) => {
    await signIn(page, "/identity-requests");
    await expect(page).toHaveURL(/\/identity-requests$/);
    const target = row(page, "الهام رحیمی");
    await expect(target).toBeVisible();

    // Someone else verifies it first; this list is stale.
    const verified = await page.request.put("/api/proxy/User/Identity", {
      data: { actionType: 2, userId: "10000000-0000-4000-8000-000000000012" },
    });
    expect(verified.status()).toBe(204);

    await target.getByRole("button", { name: "تأیید" }).click();
    const dialog = page.getByRole("alertdialog");
    await dialog.getByRole("button", { name: "تأیید" }).click();
    await expect(dialog.getByText("این درخواست دیگر در انتظار بررسی نیست")).toBeVisible();
  });

  test("the review sheet shows the identity and the documents", async ({ page }) => {
    await signIn(page, "/identity-requests?status=verified");
    await expect(page).toHaveURL(/status=verified/);

    await row(page, "مریم احمدی").getByRole("button", { name: "بررسی" }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByTestId("identity-review")).toContainText("مریم احمدی");
    await expect(sheet.getByText("حقوق کیفری")).toBeVisible();
    await expect(sheet.getByRole("link", { name: "پروانه.pdf" })).toHaveAttribute(
      "href",
      /-license\.pdf$/,
    );
    await expect(sheet.getByRole("link", { name: "کارت ملی.png" })).toHaveAttribute(
      "target",
      "_blank",
    );
    await expect(sheet.getByRole("button", { name: "ابطال" })).toBeVisible();
  });

  test("a user who is not a super-admin sees no action buttons", async ({ page }) => {
    await registerNewUser(page);
    await page.goto("/identity-requests");
    await expect(page.getByRole("cell", { name: "حسین کریمی" })).toBeVisible();

    await expect(page.getByRole("button", { name: "بررسی" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "تأیید" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "رد", exact: true })).toHaveCount(0);
  });
});
