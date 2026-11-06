import { parseResponse, type HttpClient } from "@repo/http";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import type { z } from "zod";

type ApiQueryConfig<TSchema extends z.ZodType> = {
  /** From the feature's keys object (`usersKeys.list(params)`). */
  key: QueryKey;
  url: string;
  /** Query string (`null`/`undefined` values are skipped). */
  params?: Record<string, unknown>;
  /** Response contract: the data is parsed (and transformed) before it reaches the cache. */
  schema: TSchema;
  /** Tables: keep the previous page on screen while the next one loads. */
  keepPrevious?: boolean;
  staleTime?: number;
  enabled?: boolean;
  /** Another client than the bound one (e.g. the BFF's own `/api/*` routes). */
  client?: HttpClient;
};

type ApiMutationConfig<TVariables, TSchema extends z.ZodType> = {
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  url: string | ((variables: TVariables) => string);
  /** Request body. Default: the variables themselves (none for DELETE). */
  body?: (variables: TVariables) => unknown;
  /** Response contract. Without one the result is `unknown` (e.g. 204 No Content). */
  schema?: TSchema;
  /** Keys to refetch after success; a function when they depend on the result or input. */
  invalidates?:
    | readonly QueryKey[]
    | ((data: z.output<TSchema>, variables: TVariables) => readonly QueryKey[]);
  /** Runs before the invalidation, e.g. to put the result in the cache (`setQueryData`). */
  onSuccess?: (data: z.output<TSchema>, variables: TVariables, queryClient: QueryClient) => void;
  /** No global error toast: the caller renders the error itself. */
  silent?: boolean;
  client?: HttpClient;
};

/**
 * Binds the two data hooks to the app's browser client, once per app:
 *
 *   export const { useApiQuery, useApiMutation } = createApiHooks(apiClient); // src/lib/query
 *
 * A feature then only declares WHAT it calls — the client, parsing, placeholder, cache
 * invalidation and error-toast wiring live here:
 *
 *   export const useUsersListQuery = (params: UsersListParams) =>
 *     useApiQuery({ key: usersKeys.list(params), url: USERS_ENDPOINT, params: toQuery(params),
 *                   schema: usersListResponse, keepPrevious: true });
 *
 *   export const useDeleteTaskMutation = () =>
 *     useApiMutation({ method: "DELETE", url: ({ id }: TaskId) => `/tasks/${id}`,
 *                      invalidates: [tasksKeys.all], silent: true });
 */
export function createApiHooks(defaultClient: HttpClient) {
  function useApiQuery<TSchema extends z.ZodType>({
    key,
    url,
    params,
    schema,
    keepPrevious,
    client = defaultClient,
    ...options
  }: ApiQueryConfig<TSchema>) {
    return useQuery({
      ...options,
      queryKey: key,
      queryFn: ({ signal }): Promise<z.output<TSchema>> =>
        client.get(url, { params, signal, schema }),
      placeholderData: keepPrevious ? keepPreviousData : undefined,
    });
  }

  function useApiMutation<TVariables = void, TSchema extends z.ZodType = z.ZodUnknown>(
    config: ApiMutationConfig<TVariables, TSchema>,
  ) {
    const queryClient = useQueryClient();
    const client = config.client ?? defaultClient;

    return useMutation({
      mutationFn: async (variables: TVariables): Promise<z.output<TSchema>> => {
        const url = typeof config.url === "function" ? config.url(variables) : config.url;
        const body = config.body
          ? config.body(variables)
          : config.method === "DELETE"
            ? undefined
            : variables;
        const { data } = await client.request(config.method, url, { body });
        if (config.schema) return parseResponse(config.schema, data, `${config.method} ${url}`);
        // No schema → `TSchema` is the default `ZodUnknown`, so the result type is `unknown`.
        return data as z.output<TSchema>;
      },
      meta: { silent: config.silent },
      onSuccess: async (data, variables) => {
        config.onSuccess?.(data, variables, queryClient);
        const keys =
          typeof config.invalidates === "function"
            ? config.invalidates(data, variables)
            : (config.invalidates ?? []);
        await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      },
    });
  }

  return { useApiQuery, useApiMutation };
}
