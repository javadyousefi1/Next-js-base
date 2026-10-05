import { ApiError } from "@repo/http";
import { z } from "zod";

/**
 * Error label derived from a key constant: `["users", "list", {…}]` → `"users.list"`.
 * Queries and mutations never carry a hand-written name.
 */
export function labelFromKey(key: readonly unknown[]): string {
  return key.filter((part): part is string => typeof part === "string").join(".");
}

/**
 * Input validation for every query/mutation (enforced by `makeQuery` / `makeMutation`):
 * params/variables are parsed BEFORE any request is sent → `VALIDATION`. Responses are parsed
 * with `parseResponse` (`@repo/http`).
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
