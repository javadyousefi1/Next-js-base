import { filterParams, tableSearchParams } from "@repo/table/search-params";
import { createLoader } from "nuqs/server";

import { IDENTITY_STATUSES, USER_ROLES } from "./schemas/user.schema";

/**
 * URL state of the users table. Used by `useUsersTable` (browser) and by the page's prefetch
 * (server), so both send the same params. Filter keys are the filter ids, each with the
 * `filterParams` parser of its filter type. The API has no sorting (`sortBy`/`order` stay unused).
 */
export const usersSearchParams = {
  ...tableSearchParams,
  phoneNumber: filterParams.text(),
  role: filterParams.select(USER_ROLES),
  identityStatus: filterParams.select(IDENTITY_STATUSES),
};

export const loadUsersSearchParams = createLoader(usersSearchParams);
