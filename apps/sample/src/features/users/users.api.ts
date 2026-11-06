import { z } from "zod";

import { useApiQuery } from "@/lib/query/api-hooks";

import { userRoleSchema, type UsersList, type UsersListParams } from "./schemas/user.schema";

/**
 * The ONLY file that knows the backend's users API (here DummyJSON-style: offset pagination,
 * `{ users, total }`): endpoint, query mapping, response schema, keys and queries. A new backend
 * → change this file (+ the MSW mock), nothing else: views, hooks and the BFF only see the
 * domain types in `schemas/`.
 */

/** Relative to `API_BASE_URL` on the server, or to `/api/proxy` in the browser (BFF). */
export const USERS_ENDPOINT = "/users";

/** Maps the table params to the backend query string (limit/skip pagination). */
export function toBackendListQuery(params: UsersListParams) {
  return {
    limit: params.pageSize,
    skip: (params.page - 1) * params.pageSize,
    q: params.q || undefined,
    role: params.role ?? undefined,
    sortBy: params.sortBy ?? undefined,
    order: params.sortBy ? params.order : undefined,
  };
}

const backendUserSchema = z.object({
  id: z.number().int(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.email(),
  phone: z.string(),
  age: z.number().int(),
  role: userRoleSchema.default("user"),
  company: z.object({ name: z.string(), title: z.string() }).partial().optional(),
});

/** Backend `{ users, total }` → the app's `UsersList`. */
export const usersListResponse = z
  .object({
    users: z.array(backendUserSchema),
    total: z.number().int().nonnegative(),
  })
  .transform(({ users, total }): UsersList => ({ items: users, total }));

/** Hierarchical: invalidating `all` refreshes every users query. */
export const usersKeys = {
  all: ["users"] as const,
  list: (params: UsersListParams) => ["users", "list", params] as const,
};

/** One table page; the previous page stays visible while the next one loads. */
export const useUsersListQuery = (params: UsersListParams) =>
  useApiQuery({
    key: usersKeys.list(params),
    url: USERS_ENDPOINT,
    params: toBackendListQuery(params),
    schema: usersListResponse,
    keepPrevious: true,
    staleTime: 30_000,
  });
