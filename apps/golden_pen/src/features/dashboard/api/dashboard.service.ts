import { fetchInviteLinksList } from "@/features/invite-links/api/invite-links.service";
import { fetchUsersList } from "@/features/users/api/users.service";
import type { UsersListParams } from "@/features/users/schemas/user.schema";
import type { QueryFetcher } from "@/lib/query";

import type { DashboardCountParams } from "../schemas/dashboard.schema";

const ONE_USER: UsersListParams = {
  page: 1,
  pageSize: 1,
  q: "",
  phoneNumber: null,
  role: null,
  identityStatus: null,
};

const COUNT_FETCHERS: Record<DashboardCountParams["count"], QueryFetcher<void>> = {
  users: (_, context) => fetchUsersList(ONE_USER, context),
  identityPending: (_, context) => fetchUsersList({ ...ONE_USER, identityStatus: "2" }, context),
  identityRequested: (_, context) => fetchUsersList({ ...ONE_USER, identityStatus: "1" }, context),
  inviteLinksUnused: (_, context) =>
    fetchInviteLinksList({ page: 1, pageSize: 1, isUsed: "false" }, context),
};

/** Works in the browser (BFF proxy) and on the server: `http` is injected. */
export const fetchDashboardCount: QueryFetcher<DashboardCountParams> = ({ count }, context) =>
  COUNT_FETCHERS[count]?.(undefined, context) ??
  Promise.reject(new Error(`Unknown count ${count}`));
