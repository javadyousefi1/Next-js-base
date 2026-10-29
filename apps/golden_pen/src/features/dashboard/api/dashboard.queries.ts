import { QUERY_KEYS } from "@/config/query-keys";
import { makeQuery } from "@/lib/query";

import { dashboardCountParamsSchema } from "../schemas/dashboard.schema";
import { dashboardCountResponse } from "./dashboard.backend";
import { fetchDashboardCount } from "./dashboard.service";

/** One count of the admin pulse (a number); refetched when users or invite links change. */
export const dashboardCountQuery = makeQuery({
  key: QUERY_KEYS.dashboard.count,
  params: dashboardCountParamsSchema,
  response: dashboardCountResponse,
  fetcher: fetchDashboardCount,
  relatedKeys: [QUERY_KEYS.users.lists(), QUERY_KEYS.inviteLinks.lists()],
  staleTime: 30_000,
});
