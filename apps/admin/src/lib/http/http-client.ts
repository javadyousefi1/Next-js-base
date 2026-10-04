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

export type RequestOptions<TSchema extends z.ZodType | undefined = undefined> = {
  /** Response contract: `data` is parsed with it before it is returned (`INVALID_RESPONSE`). */
  schema?: TSchema;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

/** Parsed data when the request has a schema; `unknown` otherwise (e.g. `makeQuery` parses it). */
export type ResponseData<TSchema> = TSchema extends z.ZodType ? z.output<TSchema> : unknown;

/** Status + data: the only response shape that leaves the client (no axios types). */
export type HttpResponse<TData> = { status: number; data: TData };

/**
 * The app's HTTP client. Every request, response and error goes through an instance, and only
 * two things come out:
 * - the response `data`, parsed with `schema` when the request has one
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

  async get<TSchema extends z.ZodType | undefined = undefined>(
    url: string,
    options?: RequestOptions<TSchema>,
  ) {
    return (await this.request("GET", url, options)).data;
  }

  async post<TSchema extends z.ZodType | undefined = undefined>(
    url: string,
    body?: unknown,
    options?: RequestOptions<TSchema>,
  ) {
    return (await this.request("POST", url, { ...options, body })).data;
  }

  async put<TSchema extends z.ZodType | undefined = undefined>(
    url: string,
    body?: unknown,
    options?: RequestOptions<TSchema>,
  ) {
    return (await this.request("PUT", url, { ...options, body })).data;
  }

  async patch<TSchema extends z.ZodType | undefined = undefined>(
    url: string,
    body?: unknown,
    options?: RequestOptions<TSchema>,
  ) {
    return (await this.request("PATCH", url, { ...options, body })).data;
  }

  async delete<TSchema extends z.ZodType | undefined = undefined>(
    url: string,
    options?: RequestOptions<TSchema>,
  ) {
    return (await this.request("DELETE", url, options)).data;
  }

  /** Any method, resolving to status + data (the BFF proxy forwards both). */
  async request<TSchema extends z.ZodType | undefined = undefined>(
    method: string,
    url: string,
    { schema, body, ...options }: RequestOptions<TSchema> & { body?: unknown } = {},
  ): Promise<HttpResponse<ResponseData<TSchema>>> {
    try {
      const response = await this.#axios.request<unknown>({ method, url, data: body, ...options });
      const data = schema
        ? parseResponse(schema, response.data, `${method} ${url}`)
        : response.data;
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- `schema` produced this type (`unknown` without one)
      return { status: response.status, data: data as ResponseData<TSchema> };
    } catch (error) {
      const apiError = toApiError(error);
      this.#onError?.(apiError);
      throw apiError;
    }
  }
}
