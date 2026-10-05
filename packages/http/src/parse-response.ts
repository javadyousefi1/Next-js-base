import { z } from "zod";

import { ApiError } from "./errors";

/**
 * Response validation: server data is parsed BEFORE it reaches the app (cache, UI, server code)
 * → `INVALID_RESPONSE`. Used by `HttpClient` (when a request has a `schema`), `makeQuery` and
 * `makeMutation`. Parsing applies the schema's defaults/coercions/transforms.
 */
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
