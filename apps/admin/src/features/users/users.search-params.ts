import { createLoader, parseAsStringLiteral } from "nuqs/server";

import { tableSearchParams } from "@/lib/table/search-params";

import { USER_ROLES, USER_SORT_FIELDS } from "./schemas/user.schema";

/**
 * URL state of the users table. Used by `useUsersTable` (browser) and by the page's prefetch
 * (server), so both send the same params. Filter keys match column ids (`role`).
 */
export const usersSearchParams = {
  ...tableSearchParams,
  sortBy: parseAsStringLiteral(USER_SORT_FIELDS),
  role: parseAsStringLiteral(USER_ROLES),
};

export const loadUsersSearchParams = createLoader(usersSearchParams);
