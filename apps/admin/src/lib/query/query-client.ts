import {
  defaultShouldDehydrateQuery,
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from "@tanstack/react-query";

import type { ApiError } from "@/lib/http/errors";

import "./register";

type ErrorReporter = (error: ApiError) => void;

const NON_RETRYABLE = new Set<ApiError["code"]>([
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION",
  "INVALID_RESPONSE",
  "RATE_LIMITED",
]);

/** Client errors (4xx) are deterministic — retrying them only delays the error UI. */
function shouldRetry(failureCount: number, error: ApiError): boolean {
  return failureCount < 2 && !NON_RETRYABLE.has(error.code);
}

let reportError: ErrorReporter | undefined;

/**
 * Registers the global error UI (toasts). Called once by `useQueryErrorToasts`; returns the
 * unregister function so it can be used as an effect cleanup.
 */
export function setErrorReporter(reporter: ErrorReporter): () => void {
  reportError = reporter;
  return () => {
    if (reportError === reporter) reportError = undefined;
  };
}

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      // Only background refetch failures are reported globally; first loads render their own
      // error state in the view.
      onError: (error, query) => {
        if (query.state.data !== undefined) reportError?.(error);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _onMutateResult, mutation) => {
        if (!mutation.meta?.silent) reportError?.(error);
      },
    }),
    defaultOptions: {
      queries: {
        // With SSR we want a non-zero staleTime so hydrated data isn't refetched immediately.
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: shouldRetry,
        refetchOnWindowFocus: true,
      },
      mutations: { retry: false },
      dehydrate: {
        // Stream pending queries started on the server (prefetch without await).
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/**
 * Server: a new client per request (never share user data between requests).
 * Browser: one client for the whole session (survives re-renders/suspense).
 */
export function getQueryClient(): QueryClient {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
