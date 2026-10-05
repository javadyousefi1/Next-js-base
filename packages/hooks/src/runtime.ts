/**
 * Environment guards. Use these instead of ad-hoc `typeof window` checks so the intent
 * ("this must only run in the browser") is explicit and greppable.
 */
export const isServer = typeof window === "undefined";
export const isBrowser = !isServer;

/** Throws when browser-only code is executed during SSR/RSC. */
export function assertBrowser(feature: string): void {
  if (isServer) throw new Error(`${feature} is browser-only and was called on the server.`);
}
