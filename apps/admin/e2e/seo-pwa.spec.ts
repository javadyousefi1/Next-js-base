import { expect, test } from "@playwright/test";

test.describe("SEO and PWA", () => {
  test("indexing is disabled by default", async ({ page, request }) => {
    const robots = await request.get("/robots.txt");
    expect(await robots.text()).toContain("Disallow: /");

    await page.goto("/en/login");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="alternate"][hreflang="fa-IR"]')).toHaveAttribute(
      "href",
      /\/fa\/login$/,
    );
  });

  test("the web app manifest is installable", async ({ request }) => {
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.map((icon: { sizes: string }) => icon.sizes)).toEqual(
      expect.arrayContaining(["192x192", "512x512"]),
    );
  });

  test("the service worker is never cached by the browser", async ({ request }) => {
    const response = await request.get("/sw.js");
    expect(response.ok()).toBe(true);
    expect(response.headers()["cache-control"]).toContain("no-cache");
  });

  test("the offline fallback page is public", async ({ page }) => {
    await page.goto("/en/offline");
    await expect(page.getByRole("heading", { name: "You are offline" })).toBeVisible();
  });
});
