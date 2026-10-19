import { expect, test, type Page } from "@playwright/test";

import { MEMBER_USER, signIn } from "./fixtures";

/** Every example page (`src/config/examples.ts`) with its heading. */
const EXAMPLE_PAGES = [
  ["/en/examples/data", "Data (CRUD)"],
  ["/en/examples/modal", "Modals"],
  ["/en/examples/ui", "UI components"],
  ["/en/examples/jalali", "Jalali dates"],
  ["/en/examples/hooks", "Hooks"],
  ["/en/examples/access", "Access"],
  ["/en/examples/redis", "Redis"],
] as const;

const result = (page: Page) => page.getByRole("status", { name: "Result" });

test.describe("examples", () => {
  test("the overview links every example, and every example page renders", async ({ page }) => {
    await signIn(page, "/en/examples");
    await expect(page.getByRole("heading", { name: "Examples", level: 1 })).toBeVisible();
    for (const [, heading] of EXAMPLE_PAGES) {
      await expect(page.getByRole("link", { name: heading, exact: true }).first()).toBeVisible();
    }

    for (const [path, heading] of EXAMPLE_PAGES) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    }
  });

  test("modals: awaited answers, async onAction with an error, prompt and custom content", async ({
    page,
  }) => {
    await signIn(page, "/en/examples/modal");
    await expect(page.getByRole("heading", { name: "Modals", level: 1 })).toBeVisible();

    await page.getByRole("button", { name: "Delete a group" }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete", exact: true })
      .click();
    await expect(result(page)).toHaveText("Result: Deleted.");

    await page.getByRole("button", { name: "Warning" }).click();
    await page.keyboard.press("Escape");
    await expect(result(page)).toHaveText("Result: Answer: no");

    // onAction throws once: the modal stays open with the message, the retry succeeds.
    await page.getByRole("button", { name: "Activate (fails once)" }).click();
    const trial = page.getByRole("alertdialog");
    await trial.getByRole("button", { name: "Activate Free Trial" }).click();
    await expect(trial.getByRole("alert")).toHaveText(/did not answer/);
    await trial.getByRole("button", { name: "Activate Free Trial" }).click();
    await expect(trial).toBeHidden();
    await expect(result(page)).toHaveText("Result: Answer: yes");

    await page.getByRole("button", { name: "Rename" }).click();
    const prompt = page.getByRole("dialog");
    await prompt.getByLabel("Name").fill("ab");
    await prompt.getByRole("button", { name: "Rename" }).click();
    await expect(prompt.getByText("Use at least 3 characters.")).toBeVisible();
    await prompt.getByLabel("Name").fill("Beta");
    await prompt.getByRole("button", { name: "Rename" }).click();
    await expect(result(page)).toHaveText("Result: Renamed to “Beta”.");

    await page.getByRole("button", { name: "Choose a plan" }).click();
    const plans = page.getByRole("dialog");
    await plans.getByRole("button", { name: "Team" }).click();
    await plans.getByRole("button", { name: "Help" }).click(); // a second modal on top
    await page.getByRole("alertdialog").getByRole("button", { name: "OK" }).click();
    await plans.getByRole("button", { name: "Choose" }).click();
    await expect(result(page)).toHaveText("Result: Picked plan: Team.");
  });

  test("data: create a task in a modal form, delete with confirm, API errors in the modal", async ({
    page,
  }) => {
    await signIn(page, "/en/examples/data");
    await expect(page.getByRole("heading", { name: "Data (CRUD)", level: 1 })).toBeVisible();

    await page.getByRole("button", { name: "New task" }).click();
    const form = page.getByRole("dialog");
    await form.getByLabel("Title").fill("ab");
    await form.getByRole("button", { name: "Create" }).click();
    await expect(form.getByText("Use at least 3 characters.")).toBeVisible();
    await form.getByLabel("Title").fill("Ship the examples");
    await form.getByRole("button", { name: "Create" }).click();
    await expect(form).toBeHidden();
    await expect(page.getByRole("cell", { name: "Ship the examples", exact: true })).toBeVisible();

    // The API refuses to delete a task in progress: the confirm modal shows why.
    const doing = page.getByRole("row").filter({ hasText: "In progress" }).first();
    await doing.getByRole("button", { name: /^Delete/ }).click();
    const confirm = page.getByRole("alertdialog");
    await confirm.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirm.getByRole("alert")).toHaveText(/in progress cannot be deleted/);
    await confirm.getByRole("button", { name: "Cancel" }).click();
    await expect(confirm).toBeHidden();

    await page
      .getByRole("row")
      .filter({ hasText: "Ship the examples" })
      .getByRole("button", { name: /^Delete/ })
      .click();
    await confirm.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(confirm).toBeHidden();
    await expect(page.getByRole("cell", { name: "Ship the examples", exact: true })).toHaveCount(0);
  });

  test("hooks: debounced value and a note that survives a reload", async ({ page }) => {
    await signIn(page, "/en/examples/hooks");
    await page.getByLabel("Search").fill("hello");
    // "Typed" and, 500 ms later, "Debounced value" both show it.
    await expect(page.getByRole("definition").filter({ hasText: /^hello$/ })).toHaveCount(2);

    await page.getByLabel("Note").fill("remember me");
    await page.reload();
    await expect(page.getByLabel("Note")).toHaveValue("remember me");
  });

  test("access: a member sees the fallbacks and the denied routes", async ({ page }) => {
    await signIn(page, "/en/examples/access", MEMBER_USER);
    await expect(page.getByText("Hidden: you lack users.read.")).toBeVisible();
    await expect(page.getByText("Hidden: you are not an admin.")).toBeVisible();
    await expect(
      page.getByRole("row", { name: /\/users users\.read Denied/ }).first(),
    ).toBeVisible();
  });
});
