/**
 * Runs once when the Next.js server boots, before it handles any request.
 * 1. Validates env vars (`src/env.ts`) → a misconfigured server exits at start, not mid-request.
 * 2. Starts MSW when `API_MOCKING=enabled` (local development, e2e tests, demos).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Next.js only logs a failing `register` and answers every request with 500 — exit instead.
    const { env } = await import("./env").catch((error: unknown) => {
      console.error(error);
      process.exit(1);
    });

    if (env.API_MOCKING === "enabled") {
      const { server } = await import("./mocks/node");
      server.listen({ onUnhandledFrame: "bypass" });
      console.info(`[msw] mocking ${env.API_BASE_URL}`);
    }
  }
}
