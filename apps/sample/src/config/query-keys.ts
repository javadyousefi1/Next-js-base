import type { QueryKey } from "@tanstack/react-query";

import type { UsersListParams } from "@/features/users/schemas/user.schema";

/**
 * Query-key registry. Every React Query key MUST be created here
 * (lint: `project/no-inline-query-keys`).
 *
 * Keys are hierarchical (`all` → `lists` → `list(params)`), so invalidating a parent key
 * invalidates every child. Use these keys as `relatedKeys` in `makeQuery` to link queries
 * across features (e.g. dashboard stats are related to users).
 */
const authRoot = ["auth"] as const;
const usersRoot = ["users"] as const;
const dashboardRoot = ["dashboard"] as const;

export const QUERY_KEYS = {
  auth: {
    all: authRoot,
    session: () => [...authRoot, "session"] as const,
  },
  users: {
    all: usersRoot,
    lists: () => [...usersRoot, "list"] as const,
    list: (params: UsersListParams) => [...usersRoot, "list", params] as const,
    details: () => [...usersRoot, "detail"] as const,
    detail: (id: number) => [...usersRoot, "detail", id] as const,
  },
  dashboard: {
    all: dashboardRoot,
    stats: () => [...dashboardRoot, "stats"] as const,
  },
} as const;

/** Mutation keys (devtools, `useIsMutating`). Same registry rule as query keys. */
export const MUTATION_KEYS = {
  auth: {
    login: ["auth", "login"],
    logout: ["auth", "logout"],
  },
  users: {
    create: ["users", "create"],
    update: ["users", "update"],
    remove: ["users", "remove"],
  },
} as const satisfies Record<string, Record<string, QueryKey>>;
