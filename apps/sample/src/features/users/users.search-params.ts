import { filterParams, tableSearchParams } from "@repo/table/search-params";
import { createLoader, parseAsStringLiteral } from "nuqs/server";

import { USER_ROLES, USER_SORT_FIELDS } from "./schemas/user.schema";

/**
 * URL state of the users table. Used by `useUsersTable` (browser) and by the page's prefetch
 * (server), so both send the same params. Filter keys match column ids (`role`), each with the
 * `filterParams` parser of its filter type.
 */
export const usersSearchParams = {
  ...tableSearchParams,
  sortBy: parseAsStringLiteral(USER_SORT_FIELDS),
  role: filterParams.select(USER_ROLES),
};

export const loadUsersSearchParams = createLoader(usersSearchParams);
