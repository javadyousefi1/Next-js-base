"use client";

import { useEffect } from "react";

/**
 * Registers `public/sw.js` (offline fallback + static asset cache) in production builds only —
 * a service worker in development serves stale code. Updates are picked up on the next visit
 * because `/sw.js` is served with `Cache-Control: no-cache` (next.config.ts).
 */
export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error: unknown) => console.error("[pwa] service worker registration failed", error));
  }, []);
}
