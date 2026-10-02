/**
 * Runs once when the Next.js server boots, before it handles any request.
 * 1. Validates server env vars → a misconfigured container crashes at start, not mid-request.
 * 2. Starts MSW when `API_MOCKING=enabled` (local development, e2e tests, demos).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { serverEnv } = await import("./env/server");

  if (serverEnv.API_MOCKING === "enabled") {
    const { server } = await import("./mocks/node");
    server.listen({ onUnhandledFrame: "bypass" });
    console.info(`[msw] mocking ${serverEnv.API_BASE_URL}`);
  }
}
