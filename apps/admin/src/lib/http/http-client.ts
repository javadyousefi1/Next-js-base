import axios, { type AxiosInstance } from "axios";
import type { z } from "zod";

import { toApiError, type ApiError } from "./errors";
import { parseResponse } from "./parse-response";

type HttpClientConfig = {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
  /** Send cookies (browser → BFF). */
  withCredentials?: boolean;
  /** `false` ignores HTTP(S)_PROXY from the environment (needed while MSW mocks the upstream). */
  proxy?: false;
  /** Sees every error before it is thrown (the browser reports a 401 as "session expired"). */
  onError?: (error: ApiError) => void;
};

export type RequestOptions = {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/** Response contract: `data` is parsed with `schema` (`INVALID_RESPONSE` on mismatch) and typed. */
export type ValidatedOptions<TSchema extends z.ZodType> = RequestOptions & { schema: TSchema };

/** Status + data: the only response shape that leaves the client (no axios types). */
export type HttpResponse<TData> = { status: number; data: TData };

type SendOptions = RequestOptions & { schema?: z.ZodType; body?: unknown };

/**
 * The app's HTTP client. Every request, response and error goes through an instance, and only
 * two things come out:
 * - the response data: typed and validated with `{ schema }`, `unknown` without one (then e.g.
 *   `makeQuery` parses it with its `response` schema)
 * - an `ApiError` (network, timeout, 4xx/5xx, invalid response) — never an AxiosError
 *
 *   const stats = await upstream.get(API_ENDPOINTS.stats, { schema: dashboardStatsSchema });
 *
 * Instances: `apiClient` / `bffClient` (browser → BFF, `src/lib/http/client.ts`) and
 * `upstream` / `upstreamFor(token)` (server → upstream API, `src/server/http/upstream.ts`).
 */
export class HttpClient {
  readonly #axios: AxiosInstance;
  readonly #onError: HttpClientConfig["onError"];

  constructor({ headers, onError, ...config }: HttpClientConfig) {
    this.#axios = axios.create({ ...config, headers: { Accept: "application/json", ...headers } });
    this.#onError = onError;
  }

  get(url: string, options?: RequestOptions): Promise<unknown>;
  get<S extends z.ZodType>(url: string, options: ValidatedOptions<S>): Promise<z.output<S>>;
  async get(url: string, options?: SendOptions) {
    return (await this.#send("GET", url, options)).data;
  }

  post(url: string, body?: unknown, options?: RequestOptions): Promise<unknown>;
  post<S extends z.ZodType>(
    url: string,
    body: unknown,
    options: ValidatedOptions<S>,
  ): Promise<z.output<S>>;
  async post(url: string, body?: unknown, options?: SendOptions) {
    return (await this.#send("POST", url, { ...options, body })).data;
  }

  put(url: string, body?: unknown, options?: RequestOptions): Promise<unknown>;
  put<S extends z.ZodType>(
    url: string,
    body: unknown,
    options: ValidatedOptions<S>,
  ): Promise<z.output<S>>;
  async put(url: string, body?: unknown, options?: SendOptions) {
    return (await this.#send("PUT", url, { ...options, body })).data;
  }

  patch(url: string, body?: unknown, options?: RequestOptions): Promise<unknown>;
  patch<S extends z.ZodType>(
    url: string,
    body: unknown,
    options: ValidatedOptions<S>,
  ): Promise<z.output<S>>;
  async patch(url: string, body?: unknown, options?: SendOptions) {
    return (await this.#send("PATCH", url, { ...options, body })).data;
  }

  delete(url: string, options?: RequestOptions): Promise<unknown>;
  delete<S extends z.ZodType>(url: string, options: ValidatedOptions<S>): Promise<z.output<S>>;
  async delete(url: string, options?: SendOptions) {
    return (await this.#send("DELETE", url, options)).data;
  }

  /** Any method, resolving to status + raw data (the BFF proxy forwards both). */
  request(
    method: string,
    url: string,
    options?: RequestOptions & { body?: unknown },
  ): Promise<HttpResponse<unknown>> {
    return this.#send(method, url, options);
  }

  async #send(
    method: string,
    url: string,
    { schema, body, ...options }: SendOptions = {},
  ): Promise<HttpResponse<unknown>> {
    try {
      const response = await this.#axios.request<unknown>({ method, url, data: body, ...options });
      const data = schema
        ? parseResponse(schema, response.data, `${method} ${url}`)
        : response.data;
      return { status: response.status, data };
    } catch (error) {
      const apiError = toApiError(error);
      this.#onError?.(apiError);
      throw apiError;
    }
  }
}
