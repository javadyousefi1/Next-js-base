import { z } from "zod";

/**
 * The counts of the admin pulse. Each one is a list request with `PageSize=1` of which only
 * `totalCount` is read: all users, identities Pending (2) / Requested (1), unused invite links.
 */
export const DASHBOARD_COUNTS = [
  "users",
  "identityPending",
  "identityRequested",
  "inviteLinksUnused",
] as const;
export const dashboardCountParamsSchema = z.object({ count: z.enum(DASHBOARD_COUNTS) });
export type DashboardCountParams = z.output<typeof dashboardCountParamsSchema>;
