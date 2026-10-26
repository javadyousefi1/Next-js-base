import { HttpClient } from "@repo/http";

import { API_ROUTES } from "@/config/routes";

import { emitUnauthorized } from "./auth-events";

/**
 * Browser HTTP clients. The browser never talks to the upstream API directly and never sees a
 * token: requests go to our own BFF route handlers, which read the httpOnly cookies server-side.
 *
 * - `apiClient` → `/api/proxy/*` (forwarded to the upstream API with the access token)
 * - `bffClient` → `/api/*`       (our own endpoints, e.g. auth)
 *
 * Only `features/<feature>/api/*.service.ts` files and `src/lib/query` use these.
 */
function createBrowserClient(baseURL: string): HttpClient {
  return new HttpClient({
    baseURL,
    timeout: 15_000,
    withCredentials: true,
    onError: (error) => {
      if (error.code === "UNAUTHORIZED") emitUnauthorized();
    },
  });
}

export const apiClient = createBrowserClient(API_ROUTES.proxy);
export const bffClient = createBrowserClient("/");
