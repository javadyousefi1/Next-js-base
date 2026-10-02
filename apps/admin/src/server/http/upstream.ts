import "server-only";

import axios from "axios";

import { serverEnv } from "@/env/server";
import { toApiError } from "@/lib/http/errors";

/**
 * Server-side client for the upstream REST API (`API_BASE_URL`). Only server code talks to the
 * upstream; the browser goes through the BFF (`/api/*`). Errors are normalized to `ApiError`.
 */
export const upstream = axios.create({
  baseURL: serverEnv.API_BASE_URL,
  timeout: 10_000,
  headers: { Accept: "application/json" },
});

upstream.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);

export function bearer(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}
