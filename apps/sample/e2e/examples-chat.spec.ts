import { expect, test, type Page } from "@playwright/test";

import { signIn } from "./fixtures";

/** Sends a message from the composer (Enter) and returns its text — unique per run. */
async function send(page: Page, prefix: string) {
  const text = `${prefix} ${Date.now()}`;
  await page.getByRole("textbox", { name: "Message" }).fill(text);
  await page.keyboard.press("Enter");
  return text;
}

/** Opens the actions menu of the (last) message containing `text`. */
async function openActions(page: Page, text: string) {
  const row = page.getByRole("log").getByRole("article").filter({ hasText: text }).last();
  await row.hover();
  await row.getByRole("button", { name: "Message actions" }).click();
}

test.beforeEach(async ({ page }) => {
  await signIn(page, "/en/examples/chat");
  await expect(page.getByRole("heading", { name: "Chat", level: 1 })).toBeVisible();
});

test("opens at the latest message with a virtualized history, sends and gets a reply", async ({
  page,
}) => {
  const log = page.getByRole("log", { name: "Conversation with Sara" });
  await expect(log.getByText("Today", { exact: true })).toBeVisible();
  // 1200 seeded messages, a page of 40 loaded, only the visible rows in the DOM.
  expect(await log.getByRole("article").count()).toBeLessThan(40);
  await expect(page.getByText("online")).toBeVisible();

  const text = await send(page, "Hello Sara");
  await expect(log.getByText(text)).toBeVisible();
  await expect(page.getByText("typing…")).toBeVisible();
  // Sara answers below it, and the list follows to the bottom.
  await expect(log.getByRole("article").last()).not.toContainText(text, { timeout: 10_000 });
  await expect(log.getByRole("article").last()).toBeInViewport();
});

test("over the WebSocket: reply, edit and delete a message", async ({ page }) => {
  await page.getByRole("button", { name: "WebSocket" }).click();
  await expect(page.getByText("online")).toBeVisible();
  const log = page.getByRole("log");

  const first = await send(page, "Socket message");
  await expect(log.getByText(first)).toBeVisible();

  await openActions(page, first);
  await page.getByRole("menuitem", { name: "Reply" }).click();
  await expect(page.getByText("Replying to You")).toBeVisible();
  const reply = await send(page, "A reply");
  await expect(log.getByRole("button", { name: /Show the message from You/ })).toBeVisible();

  await openActions(page, reply);
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.getByRole("textbox", { name: "Message" }).fill(`${reply} (edited)`);
  await page.keyboard.press("Enter");
  await expect(log.getByText(`${reply} (edited)`)).toBeVisible();

  await openActions(page, `${reply} (edited)`);
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete", exact: true }).click();
  await expect(log.getByText(`${reply} (edited)`)).toBeHidden();
  await expect(log.getByText("This message was deleted").last()).toBeVisible();
});
