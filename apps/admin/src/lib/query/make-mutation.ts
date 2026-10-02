import {
  useMutation,
  useQueryClient,
  type MutationKey,
  type QueryKey,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { z } from "zod";

import type { ApiError } from "@/lib/http/errors";

import { invalidateKeys } from "./invalidate";
import { parseInput, parseResponse } from "./validation";

type Invalidates<TData, TVariables> =
  | readonly QueryKey[]
  | ((data: TData, variables: TVariables) => readonly QueryKey[]);

type MakeMutationConfig<TVariablesSchema extends z.ZodType, TResponseSchema extends z.ZodType> = {
  /** Debug label used in validation errors, e.g. "users.create". */
  name: string;
  /** Key from `MUTATION_KEYS`. */
  mutationKey: MutationKey;
  /** Input contract (the same schema the form uses). `z.void()` when there is no input. */
  variables: TVariablesSchema;
  /** Output contract. The mutationFn result is parsed with it. */
  response: TResponseSchema;
  /** Performs the request with the PARSED variables and returns raw data. */
  mutationFn: (variables: z.output<TVariablesSchema>) => Promise<unknown>;
  /**
   * Keys to invalidate after success. Related queries (`makeQuery({ relatedKeys })`) are
   * invalidated as well. The mutation stays pending until the invalidation is done.
   */
  invalidates?: Invalidates<z.output<TResponseSchema>, z.output<TVariablesSchema>>;
  /** Don't show the global error toast; the caller renders the error. */
  silent?: boolean;
};

type MutationOverrides<TData, TVariables> = Omit<
  UseMutationOptions<TData, ApiError, TVariables>,
  "mutationKey" | "mutationFn" | "meta"
>;

/**
 * Builds a typed, validated mutation definition. The ONLY way to declare a mutation.
 * Variables are parsed before the request (`VALIDATION`), responses after it
 * (`INVALID_RESPONSE`), then `invalidates` (+ related keys) are invalidated.
 */
export function makeMutation<TVariablesSchema extends z.ZodType, TResponseSchema extends z.ZodType>(
  config: MakeMutationConfig<TVariablesSchema, TResponseSchema>,
) {
  type TVariablesInput = z.input<TVariablesSchema>;
  type TData = z.output<TResponseSchema>;

  const run = async (input: TVariablesInput): Promise<TData> => {
    const variables = parseInput(config.variables, input, config.name);
    const raw = await config.mutationFn(variables);
    return parseResponse(config.response, raw, config.name);
  };

  return {
    name: config.name,
    mutationKey: config.mutationKey,

    useMutation(overrides?: MutationOverrides<TData, TVariablesInput>) {
      const queryClient = useQueryClient();

      return useMutation<TData, ApiError, TVariablesInput>({
        ...overrides,
        mutationKey: config.mutationKey,
        mutationFn: run,
        meta: { silent: config.silent },
        onSuccess: async (data, input, onMutateResult, context) => {
          const variables = config.variables.parse(input);
          const keys =
            typeof config.invalidates === "function"
              ? config.invalidates(data, variables)
              : config.invalidates;
          if (keys && keys.length > 0) await invalidateKeys(queryClient, keys);
          await overrides?.onSuccess?.(data, input, onMutateResult, context);
        },
      });
    },
  };
}
