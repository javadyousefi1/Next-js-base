/**
 * Regenerates the PWA PNG icons from `apps/admin/public/icons/icon.svg` with Playwright's
 * Chromium (no image tooling needed). Run: `bun run icons` (root).
 *
 * Set PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH to use a preinstalled Chromium.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const iconsDir = path.join(root, "apps/admin/public/icons");
// @playwright/test is a dependency of the admin app: resolve it from there.
const { chromium } = (await import(
  Bun.resolveSync("@playwright/test", path.join(root, "apps/admin"))
)) as typeof import("@playwright/test");

const svg = await readFile(path.join(iconsDir, "icon.svg"), "utf8");
const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const targets = [
  { file: "icon-192.png", size: 192, padding: 0 },
  { file: "icon-512.png", size: 512, padding: 0 },
  // Maskable icons need a safe zone: keep the artwork inside the central 80%.
  { file: "icon-maskable-512.png", size: 512, padding: 0.1, background: "#0a0a0a" },
  { file: "apple-touch-icon.png", size: 180, padding: 0, background: "#0a0a0a" },
];

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
});
const page = await browser.newPage();

for (const target of targets) {
  const inset = Math.round(target.size * target.padding);
  await page.setViewportSize({ width: target.size, height: target.size });
  await page.setContent(
    `<body style="margin:0;background:${target.background ?? "transparent"}">
      <img src="${dataUrl}" style="display:block;margin:${inset}px;width:${target.size - inset * 2}px;height:${target.size - inset * 2}px">
    </body>`,
  );
  await page.screenshot({
    path: path.join(iconsDir, target.file),
    omitBackground: !target.background,
  });
  console.log(`✔ ${target.file}`);
}

await browser.close();
