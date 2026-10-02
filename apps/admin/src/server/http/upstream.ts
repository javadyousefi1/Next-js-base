import "server-only";
import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { z } from "zod";

import { serverEnv } from "@/env/server";
import { toApiError } from "@/lib/http/errors";
import { parseResponse } from "@/lib/query/validation";

export function bearer(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

function createUpstreamClient(headers: Record<string, string> = {}): AxiosInstance {
  const client = axios.create({
    baseURL: serverEnv.API_BASE_URL,
    timeout: 10_000,
    headers: { Accept: "application/json", ...headers },
    // MSW intercepts requests inside this process: a mocked upstream must never go through an
    // HTTP(S)_PROXY from the environment (the proxy would receive — and reject — the call).
    ...(serverEnv.API_MOCKING === "enabled" && { proxy: false as const }),
  });

  client.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(toApiError(error)),
  );

  return client;
}

/**
 * Server-side client for the upstream REST API (`API_BASE_URL`). Only server code talks to the
 * upstream; the browser goes through the BFF (`/api/*`). Errors are normalized to `ApiError`.
 */
export const upstream = createUpstreamClient();

/** Upstream client that sends the user's access token (server prefetch, `<PrefetchBoundary>`). */
export function upstreamFor(accessToken: string): AxiosInstance {
  return createUpstreamClient(bearer(accessToken));
}

/**
 * Typed calls: the response is validated with `schema` (`INVALID_RESPONSE` on mismatch) and the
 * error is labelled with the endpoint constant itself (`GET /stats`) — no free-text labels.
 */
export async function upstreamGet<TSchema extends z.ZodType>(
  url: string,
  schema: TSchema,
  config?: AxiosRequestConfig,
): Promise<z.output<TSchema>> {
  const { data } = await upstream.get<unknown>(url, config);
  return parseResponse(schema, data, `GET ${url}`);
}

export async function upstreamPost<TSchema extends z.ZodType>(
  url: string,
  body: unknown,
  schema: TSchema,
  config?: AxiosRequestConfig,
): Promise<z.output<TSchema>> {
  const { data } = await upstream.post<unknown>(url, body, config);
  return parseResponse(schema, data, `POST ${url}`);
}
