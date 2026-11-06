import { z } from "zod";

import type { DashboardCountParams } from "./schemas/dashboard.schema";

/**
 * The dashboard counts reuse the users / invite-links list requests (`PageSize=1`) and read
 * `totalCount` only; the list items are ignored. The request shape lives in those features'
 * `*.api.ts`.
 */
export const dashboardCountResponse = z
  .object({ totalCount: z.number().int().nonnegative() })
  .transform(({ totalCount }) => totalCount);

/**
 * Hierarchical: invalidating `all` refreshes every count. Declared here, not in `dashboard.api.ts`,
 * so the users / invite-links mutations can import it without an import cycle (the dashboard
 * API reads their list requests).
 */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  count: (params: DashboardCountParams) => ["dashboard", "count", params] as const,
};
