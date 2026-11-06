import { createApiHooks } from "@repo/query";

import { apiClient } from "@/lib/http/client";

/**
 * This app's data hooks, bound to the BFF proxy client. Features declare their endpoints with
 * them in `<f>.api.ts` (`useApiQuery` for reads, `useApiMutation` for writes).
 */
export const { useApiQuery, useApiMutation } = createApiHooks(apiClient);
