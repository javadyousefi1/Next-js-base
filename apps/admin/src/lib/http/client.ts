import axios, { type AxiosInstance } from "axios";

import { API_ROUTES } from "@/config/routes";

import { toApiError } from "./errors";
import { emitUnauthorized } from "./auth-events";

/**
 * Browser HTTP clients. The browser never talks to the upstream API directly and never sees a
 * token: requests go to our own BFF route handlers, which read the httpOnly cookies server-side.
 *
 * - `apiClient` → `/api/proxy/*` (forwarded to the upstream API with the access token)
 * - `bffClient` → `/api/*`       (our own endpoints, e.g. auth)
 *
 * Only `features/<feature>/api/*.service.ts` files may import these (lint: no-restricted-imports).
 */
function createHttpClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 15_000,
    withCredentials: true,
    headers: { Accept: "application/json" },
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const apiError = toApiError(error);
      if (apiError.code === "UNAUTHORIZED") emitUnauthorized();
      return Promise.reject(apiError);
    },
  );

  return client;
}

export const apiClient = createHttpClient(API_ROUTES.proxy);
export const bffClient = createHttpClient("/");
