import { parseResponse, type ApiError, type HttpClient } from "@repo/http";
import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
  type QueryClient,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { z } from "zod";

import { invalidateKeys } from "./invalidate";
import { labelFromKey, parseInput } from "./validation";

export type QueryFetcherContext = {
  signal: AbortSignal;
  /**
   * Where the request goes. Browser: the client bound with `createMakeQuery` (the app's BFF
   * client). Server prefetch: the client `<PrefetchBoundary>` passes (upstream + user token).
   * Use endpoint paths the BFF maps 1:1, so one fetcher works on both sides.
   */
  http: HttpClient;
};

/**
 * Performs the request. Receives the PARSED params and returns the raw (`unknown`) data —
 * the `response` schema turns it into the typed result:
 * `(params, { http, signal }) => http.get(API_ENDPOINTS.users.list, { params, signal })`.
 */
export type QueryFetcher<TParams> = (
  params: TParams,
  context: QueryFetcherContext,
) => Promise<unknown>;

/** Server prefetch unit, created by `xQuery.with(params)`; run by `<PrefetchBoundary>`. */
export type PrefetchItem = {
  prefetch: (queryClient: QueryClient, http: HttpClient) => Promise<void>;
};

type MakeQueryConfig<TParamsSchema extends z.ZodType, TResponseSchema extends z.ZodType> = {
  /** Key factory from `QUERY_KEYS` (never an inline array). Also names validation errors. */
  key: (params: z.output<TParamsSchema>) => QueryKey;
  /** Input contract. Use `z.void()` for queries without params. */
  params: TParamsSchema;
  /** Output contract. The fetcher result is parsed with it before reaching the cache. */
  response: TResponseSchema;
  fetcher: QueryFetcher<z.output<TParamsSchema>>;
  /**
   * Keys this query depends on. Invalidating any of them (directly, from a mutation's
   * `invalidates`, or through another related query) refetches this query as well.
   */
  relatedKeys?: readonly QueryKey[];
  staleTime?: number;
  gcTime?: number;
};

type QueryOverrides<TData> = Partial<
  Pick<
    UseQueryOptions<TData, ApiError, TData>,
    | "enabled"
    | "placeholderData"
    | "staleTime"
    | "refetchInterval"
    | "refetchOnWindowFocus"
    | "retry"
  >
>;

/**
 * Binds `makeQuery` to the client queries use by default (the app's browser client). Each app
 * does this once:
 *
 *   export const makeQuery = createMakeQuery(apiClient); // apps/<app>/src/lib/query/index.ts
 *
 * Server prefetch (`xQuery.with(params)`) gets its client from `<PrefetchBoundary>` instead.
 */
export function createMakeQuery(defaultHttp: HttpClient) {
  return <TParamsSchema extends z.ZodType, TResponseSchema extends z.ZodType>(
    config: MakeQueryConfig<TParamsSchema, TResponseSchema>,
  ) => makeQuery(config, defaultHttp);
}

/**
 * Builds a typed, validated, reusable query definition. This is the ONLY way to declare a query
 * (raw `useQuery` is lint-banned outside `@repo/query`).
 *
 * - params are parsed with `params` before the request (invalid → `ApiError("VALIDATION")`)
 * - responses are parsed with `response` (unexpected shape → `ApiError("INVALID_RESPONSE")`)
 * - `relatedKeys` make the query refetch whenever a related key is invalidated
 * - `xQuery.with(params)` prefetches it on the server (`<PrefetchBoundary>`) with zero extra code
 *
 * @example
 * export const usersListQuery = makeQuery({
 *   key: QUERY_KEYS.users.list,
 *   params: usersListParamsSchema,
 *   response: usersListResponseSchema,
 *   fetcher: fetchUsersList, // (params, { http, signal }) => http.get(API_ENDPOINTS.users.list, …)
 * });
 */
function makeQuery<TParamsSchema extends z.ZodType, TResponseSchema extends z.ZodType>(
  config: MakeQueryConfig<TParamsSchema, TResponseSchema>,
  defaultHttp: HttpClient,
) {
  type TParamsInput = z.input<TParamsSchema>;
  type TParams = z.output<TParamsSchema>;
  type TData = z.output<TResponseSchema>;

  const resolveParams = (input: TParamsInput) => {
    const result = config.params.safeParse(input);
    return result.success
      ? { params: result.data, valid: true as const }
      : { params: input as unknown as TParams, valid: false as const };
  };

  const options = (input: TParamsInput, http: HttpClient = defaultHttp) => {
    // The key is built from the parsed params so `{}` and `{ page: 1 }` share one cache entry.
    const { params, valid } = resolveParams(input);
    const queryKey = config.key(params);
    const label = labelFromKey(queryKey);

    return queryOptions<TData, ApiError, TData>({
      queryKey,
      queryFn: async ({ signal }) => {
        const parsedParams = valid ? params : parseInput(config.params, input, label);
        const raw = await config.fetcher(parsedParams, { signal, http });
        return parseResponse(config.response, raw, label);
      },
      meta: { relatedKeys: config.relatedKeys },
      staleTime: config.staleTime,
      gcTime: config.gcTime,
    });
  };

  return {
    key: config.key,
    options,

    useQuery(params: TParamsInput, overrides?: QueryOverrides<TData>) {
      return useQuery({ ...options(params), ...overrides });
    },

    useSuspenseQuery(params: TParamsInput) {
      return useSuspenseQuery(options(params));
    },

    /**
     * Server prefetch: `<PrefetchBoundary queries={[usersListQuery.with(params)]}>`. Params may
     * be a promise (e.g. parsed `searchParams`). Never throws — a failed prefetch simply falls
     * back to a client fetch.
     */
    with(params: TParamsInput | Promise<TParamsInput>): PrefetchItem {
      return {
        prefetch: async (queryClient, http) =>
          queryClient.prefetchQuery(options(await params, http)),
      };
    },

    getData(queryClient: QueryClient, params: TParamsInput) {
      return queryClient.getQueryData<TData>(options(params).queryKey);
    },

    setData(
      queryClient: QueryClient,
      params: TParamsInput,
      updater: (old: TData | undefined) => TData,
    ) {
      return queryClient.setQueryData<TData>(options(params).queryKey, updater);
    },

    invalidate(queryClient: QueryClient, params: TParamsInput) {
      return invalidateKeys(queryClient, [options(params).queryKey]);
    },
  };
}
