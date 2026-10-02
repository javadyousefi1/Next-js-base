import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;
const isCI = Boolean(process.env.CI);

/**
 * End-to-end tests against the PRODUCTION build (`next start`), with the upstream API mocked by
 * MSW (`API_MOCKING=enabled`): no backend needed, and no Redis either (rate limiting fails open).
 *
 *   bun run test:e2e            # from the repo root: turbo builds first, then runs Playwright
 *   bunx playwright test --ui   # from apps/admin, interactive
 *
 * PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH: use a preinstalled Chromium instead of the downloaded one.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    locale: "en-US",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
        },
      },
    },
  ],
  webServer: {
    command: `bun run start --port ${PORT}`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    env: {
      API_MOCKING: "enabled",
      API_BASE_URL: process.env.API_BASE_URL ?? "https://api.example.test",
      REDIS_URL: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
      // Plain HTTP on localhost: Secure cookies would not be sent back by the browser.
      AUTH_COOKIE_SECURE: "false",
    },
  },
});
