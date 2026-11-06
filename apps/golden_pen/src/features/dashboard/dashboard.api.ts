import {
  INVITE_LINKS_ENDPOINT,
  toBackendListQuery as toInviteLinksQuery,
} from "@/features/invite-links/invite-links.api";
import type { UsersListParams } from "@/features/users/schemas/user.schema";
import { toBackendListQuery as toUsersQuery, USERS_ENDPOINT } from "@/features/users/users.api";
import { useApiQuery } from "@/lib/query/api-hooks";

import { dashboardCountResponse, dashboardKeys } from "./dashboard.backend";
import type { DashboardCountParams } from "./schemas/dashboard.schema";

/**
 * The ONLY file that knows how the dashboard counts are requested: a list request with
 * `PageSize=1` of the users / invite-links API (their endpoints and query mapping are imported),
 * answered with `{ totalCount }`. Keys live in `dashboard.backend.ts`.
 */

const ONE_USER: UsersListParams = {
  page: 1,
  pageSize: 1,
  q: "",
  phoneNumber: null,
  role: null,
  identityStatus: null,
};

const usersCount = (identityStatus: UsersListParams["identityStatus"]) => ({
  url: USERS_ENDPOINT,
  params: toUsersQuery({ ...ONE_USER, identityStatus }),
});

const COUNT_REQUESTS: Record<
  DashboardCountParams["count"],
  { url: string; params: Record<string, unknown> }
> = {
  users: usersCount(null),
  identityPending: usersCount("2"),
  identityRequested: usersCount("1"),
  inviteLinksUnused: {
    url: INVITE_LINKS_ENDPOINT,
    params: toInviteLinksQuery({ page: 1, pageSize: 1, isUsed: "false" }),
  },
};

/** One count of the admin pulse (a number); refreshed when users or invite links change. */
export const useDashboardCountQuery = (params: DashboardCountParams) =>
  useApiQuery({
    key: dashboardKeys.count(params),
    url: COUNT_REQUESTS[params.count].url,
    params: COUNT_REQUESTS[params.count].params,
    schema: dashboardCountResponse,
    staleTime: 30_000,
  });
