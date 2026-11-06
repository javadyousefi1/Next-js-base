import type { z } from "zod";

import { apiErrorFromResponse, toApiError, type ApiError } from "./errors";
import { parseResponse } from "./parse-response";

type HttpClientConfig = {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
  /** Send cookies (browser → BFF). */
  withCredentials?: boolean;
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

/** Status + data: the only response shape that leaves the client (no fetch types). */
export type HttpResponse<TData> = { status: number; data: TData };

type SendOptions = RequestOptions & { schema?: z.ZodType; body?: unknown };

/**
 * The app's HTTP client. Every request, response and error goes through an instance, and only
 * two things come out:
 * - the response data: typed and validated with `{ schema }`, `unknown` without one (then e.g.
 *   parse it yourself)
 * - an `ApiError` (network, timeout, 4xx/5xx, invalid response) — never a raw fetch error
 *
 *   const stats = await upstream.get(STATS_ENDPOINT, { schema: dashboardStatsResponse });
 *
 * Apps create the instances, one per base URL (e.g. a browser client for their BFF and a
 * server client for the upstream API).
 */
export class HttpClient {
  readonly #config: HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.#config = config;
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
    { schema, body, params, headers, signal }: SendOptions = {},
  ): Promise<HttpResponse<unknown>> {
    const { baseURL, timeout, withCredentials, onError } = this.#config;
    try {
      const timeoutSignal = timeout > 0 ? AbortSignal.timeout(timeout) : undefined;
      const signals = [signal, timeoutSignal].filter((item) => item !== undefined);
      const response = await fetch(buildUrl(baseURL, url, params), {
        method,
        headers: {
          Accept: "application/json",
          ...this.#config.headers,
          ...(isRawBody(body) || body === undefined ? {} : { "Content-Type": "application/json" }),
          ...headers,
        },
        body: body === undefined ? undefined : isRawBody(body) ? body : JSON.stringify(body),
        credentials: withCredentials ? "include" : "same-origin",
        signal: signals.length ? AbortSignal.any(signals) : undefined,
      });
      const payload = await readBody(response);
      if (!response.ok) throw apiErrorFromResponse(response, payload);

      const data = schema ? parseResponse(schema, payload, `${method} ${url}`) : payload;
      return { status: response.status, data };
    } catch (error) {
      // A cancelled request is not an error: TanStack Query must see the abort.
      if (signal?.aborted) throw error;
      const apiError = toApiError(error);
      onError?.(apiError);
      throw apiError;
    }
  }
}

type RawBody = string | FormData | Blob | URLSearchParams | ArrayBuffer;

/** Bodies `fetch` understands natively; everything else is sent as JSON. */
function isRawBody(body: unknown): body is RawBody {
  return (
    typeof body === "string" ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  );
}

/** `baseURL` + `url` + query string (null/undefined skipped, arrays as `key[]=a&key[]=b`). */
function buildUrl(baseURL: string, url: string, params?: Record<string, unknown>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) query.append(`${key}[]`, queryValue(item));
    } else {
      query.append(key, queryValue(value));
    }
  }
  const path = /^https?:\/\//.test(url)
    ? url
    : `${baseURL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
  const search = query.toString();
  if (!search) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${search}`;
}

function queryValue(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

/** 204/empty → `undefined`; JSON when the content type says so, else the text. */
async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  const isJson = response.headers.get("content-type")?.includes("json") ?? false;
  if (!isJson) return text;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}
