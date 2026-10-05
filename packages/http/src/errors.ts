import { isAxiosError } from "axios";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION"
  | "INVALID_RESPONSE"
  | "RATE_LIMITED"
  | "NETWORK"
  | "TIMEOUT"
  | "SERVER"
  | "UNKNOWN";

type ApiErrorInit = {
  status: number | null;
  code: ApiErrorCode;
  details?: unknown;
  retryAfterSeconds?: number;
};

/**
 * The single error type that leaves the HTTP layer. React Query is typed with it
 * (`Register.defaultError`), so every `error` in hooks is an `ApiError`.
 */
export class ApiError extends Error {
  override readonly name = "ApiError";
  readonly status: number | null;
  readonly code: ApiErrorCode;
  readonly details: unknown;
  readonly retryAfterSeconds: number | undefined;

  constructor(message: string, init: ApiErrorInit) {
    super(message);
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.retryAfterSeconds = init.retryAfterSeconds;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function codeFromStatus(status: number): ApiErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 400 || status === 422) return "VALIDATION";
  if (status === 429) return "RATE_LIMITED";
  if (status >= 500) return "SERVER";
  return "UNKNOWN";
}

function messageFromBody(body: unknown): string | undefined {
  if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
    return body.message;
  }
  return undefined;
}

/** Normalizes anything thrown by axios (or our own code) into an `ApiError`. */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) return error;

  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return new ApiError("Request timed out", { status: null, code: "TIMEOUT" });
    }
    if (!error.response) {
      return new ApiError("Network error", { status: null, code: "NETWORK" });
    }

    const { status, data, headers } = error.response;
    const retryAfter = Number(headers["retry-after"]);
    return new ApiError(messageFromBody(data) ?? error.message, {
      status,
      code: codeFromStatus(status),
      details: data,
      retryAfterSeconds: Number.isFinite(retryAfter) ? retryAfter : undefined,
    });
  }

  if (error instanceof Error) return new ApiError(error.message, { status: null, code: "UNKNOWN" });
  return new ApiError("Unknown error", { status: null, code: "UNKNOWN", details: error });
}
