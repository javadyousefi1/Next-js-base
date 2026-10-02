import { z } from "zod";

import { ApiError } from "@/lib/http/errors";

/**
 * Error label derived from a key constant: `["users", "list", {…}]` → `"users.list"`.
 * Queries and mutations never carry a hand-written name.
 */
export function labelFromKey(key: readonly unknown[]): string {
  return key.filter((part): part is string => typeof part === "string").join(".");
}

/**
 * Boundary validation for every query/mutation (enforced by `makeQuery` / `makeMutation`):
 * - `input`    → params/variables are parsed BEFORE any request is sent  → `VALIDATION`
 * - `response` → server data is parsed BEFORE it reaches the cache/UI    → `INVALID_RESPONSE`
 * Parsing (not just checking) means defaults/coercions/transforms from the schema are applied.
 */
export function parseInput<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
  label: string,
): z.output<TSchema> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  throw new ApiError(`Invalid input for ${label}: ${z.prettifyError(result.error)}`, {
    status: null,
    code: "VALIDATION",
    details: z.flattenError(result.error),
  });
}

export function parseResponse<TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
  label: string,
): z.output<TSchema> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  if (process.env.NODE_ENV !== "production") {
    console.error(
      `[api-contract] ${label} returned an unexpected shape`,
      z.treeifyError(result.error),
    );
  }
  throw new ApiError(`Unexpected response from ${label}`, {
    status: null,
    code: "INVALID_RESPONSE",
    details: z.flattenError(result.error),
  });
}
