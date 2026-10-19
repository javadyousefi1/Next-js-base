/**
 * Minimal, dependency-free service worker (PWA):
 * - page navigations: network first → precached `/<locale>/offline` page when offline
 * - `/_next/static/*` (hashed, immutable): cache first, so the offline page keeps its styles
 * - everything else (API, auth, RSC payloads) is NEVER cached — it always goes to the network
 *
 * Bump VERSION to drop old caches. Registered by `useServiceWorker` (production only).
 */
const VERSION = "v1";
const CACHE = `admin-${VERSION}`;
const LOCALES = ["en", "fa"];
const PRECACHE = [...LOCALES.map((locale) => `/${locale}/offline`), "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("admin-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function offlinePageFor(url) {
  const locale =
    LOCALES.find((candidate) => url.pathname.startsWith(`/${candidate}`)) ?? LOCALES[0];
  return caches.match(`/${locale}/offline`);
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => (await offlinePageFor(url)) ?? Response.error()),
    );
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
  }
});
