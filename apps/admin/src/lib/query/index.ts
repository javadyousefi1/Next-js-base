import { createMakeQuery } from "@repo/query";

import { apiClient } from "@/lib/http/client";

/** The query layer lives in `@repo/query`; this file only binds it to this app. */
export * from "@repo/query";

/**
 * This app's `makeQuery`: in the browser, queries fetch through the BFF proxy (`apiClient`);
 * `<PrefetchBoundary>` passes the upstream client with the user's token on the server.
 */
export const makeQuery = createMakeQuery(apiClient);
