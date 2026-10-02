import {
  queryOptions,
  useQuery,
  useSuspenseQuery,
  type QueryClient,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { z } from "zod";

import type { ApiError } from "@/lib/http/errors";

import { invalidateKeys } from "./invalidate";
import { parseInput, parseResponse } from "./validation";

type FetcherContext = { signal: AbortSignal };

/**
 * Performs the request. Receives the PARSED params and returns raw (`unknown`) data —
 * the response schema turns it into the typed result.
 */
export type QueryFetcher<TParams> = (params: TParams, context: FetcherContext) => Promise<unknown>;

type MakeQueryConfig<TParamsSchema extends z.ZodType, TResponseSchema extends z.ZodType> = {
  /** Debug label used in validation errors, e.g. "users.list". */
  name: string;
  /** Key factory from `QUERY_KEYS` (never an inline array). Receives the parsed params. */
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
    UseQueryOptions<TData, ApiError, TData, QueryKey>,
    | "enabled"
    | "placeholderData"
    | "staleTime"
    | "refetchInterval"
    | "refetchOnWindowFocus"
    | "retry"
  >
>;

/**
 * Builds a typed, validated, reusable query definition. This is the ONLY way to declare a query
 * (raw `useQuery` is lint-banned outside `src/lib/query`).
 *
 * - params are parsed with `params` before the request (invalid → `ApiError("VALIDATION")`)
 * - responses are parsed with `response` (unexpected shape → `ApiError("INVALID_RESPONSE")`)
 * - `relatedKeys` make the query refetch whenever a related key is invalidated
 *
 * @example
 * export const usersListQuery = makeQuery({
 *   name: "users.list",
 *   key: QUERY_KEYS.users.list,
 *   params: usersListParamsSchema,
 *   response: usersListResponseSchema,
 *   fetcher: (params, { signal }) => usersService.list(params, { signal }),
 * });
 * const query = usersListQuery.useQuery(params); // inside a feature hook
 */
export function makeQuery<TParamsSchema extends z.ZodType, TResponseSchema extends z.ZodType>(
  config: MakeQueryConfig<TParamsSchema, TResponseSchema>,
) {
  type TParamsInput = z.input<TParamsSchema>;
  type TParams = z.output<TParamsSchema>;
  type TData = z.output<TResponseSchema>;

  const resolveParams = (input: TParamsInput) => {
    const result = config.params.safeParse(input);
    return result.success
      ? { params: result.data as TParams, valid: true as const }
      : { params: input as unknown as TParams, valid: false as const };
  };

  const options = (input: TParamsInput, fetcher: QueryFetcher<TParams> = config.fetcher) => {
    // The key is built from the parsed params so `{}` and `{ page: 1 }` share one cache entry.
    const { params, valid } = resolveParams(input);

    return queryOptions<TData, ApiError, TData, QueryKey>({
      queryKey: config.key(params),
      queryFn: async ({ signal }) => {
        const parsedParams = valid ? params : parseInput(config.params, input, config.name);
        const raw = await fetcher(parsedParams, { signal });
        return parseResponse(config.response, raw, config.name);
      },
      meta: { relatedKeys: config.relatedKeys },
      staleTime: config.staleTime,
      gcTime: config.gcTime,
    });
  };

  return {
    name: config.name,
    key: config.key,
    options,

    useQuery(params: TParamsInput, overrides?: QueryOverrides<TData>) {
      return useQuery({ ...options(params), ...overrides });
    },

    useSuspenseQuery(params: TParamsInput) {
      return useSuspenseQuery(options(params));
    },

    /**
     * SSR prefetch. On the server pass a server-side `fetcher` (relative BFF URLs only resolve
     * in the browser). Never throws — a failed prefetch simply falls back to a client fetch.
     */
    prefetch(
      queryClient: QueryClient,
      params: TParamsInput,
      { fetcher }: { fetcher?: QueryFetcher<TParams> } = {},
    ) {
      return queryClient.prefetchQuery(options(params, fetcher));
    },

    getData(queryClient: QueryClient, params: TParamsInput) {
      return queryClient.getQueryData<TData>(options(params).queryKey);
    },

    setData(queryClient: QueryClient, params: TParamsInput, updater: (old: TData | undefined) => TData) {
      return queryClient.setQueryData<TData>(options(params).queryKey, updater);
    },

    invalidate(queryClient: QueryClient, params: TParamsInput) {
      return invalidateKeys(queryClient, [options(params).queryKey]);
    },
  };
}
