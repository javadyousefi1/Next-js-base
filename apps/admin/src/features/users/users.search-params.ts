import { createLoader, parseAsStringLiteral } from "nuqs/server";

import { tableSearchParams, type SortOrder } from "@/lib/table/search-params";

import {
  USER_ROLES,
  USER_SORT_FIELDS,
  type UserRole,
  type UsersListParams,
} from "./schemas/user.schema";

/** Filters specific to the users table (the shared table params live in `@/lib/table`). */
export const usersFilterParams = {
  role: parseAsStringLiteral(USER_ROLES),
};

/** Server-side reader of the exact URL state the client hooks write. */
export const loadUsersSearchParams = createLoader({ ...tableSearchParams, ...usersFilterParams });

type UsersUrlState = {
  page: number;
  pageSize: number;
  q: string;
  sortBy: string | null;
  order: SortOrder;
  role: UserRole | null;
};

/**
 * URL state → query params. Shared by the server prefetch and the client hook, so both build
 * the same query key. Unknown sort columns (hand-edited URLs) are dropped.
 */
export function toUsersListParams(state: UsersUrlState): UsersListParams {
  return {
    ...state,
    sortBy: USER_SORT_FIELDS.find((field) => field === state.sortBy) ?? null,
  };
}
