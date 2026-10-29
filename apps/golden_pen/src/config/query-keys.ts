import type { QueryKey } from "@tanstack/react-query";

import type { UsersListParams } from "@/features/users/schemas/user.schema";

/**
 * Query-key registry. Every React Query key MUST be created here
 * (lint: `project/no-inline-query-keys`).
 *
 * Keys are hierarchical (`all` → `lists` → `list(params)`), so invalidating a parent key
 * invalidates every child. Use these keys as `relatedKeys` in `makeQuery` to link queries
 * across features.
 */
const authRoot = ["auth"] as const;
const usersRoot = ["users"] as const;

export const QUERY_KEYS = {
  auth: {
    all: authRoot,
    session: () => [...authRoot, "session"] as const,
  },
  users: {
    all: usersRoot,
    lists: () => [...usersRoot, "list"] as const,
    list: (params: UsersListParams) => [...usersRoot, "list", params] as const,
  },
} as const;

/** Mutation keys (devtools, `useIsMutating`). Same registry rule as query keys. */
export const MUTATION_KEYS = {
  auth: {
    login: ["auth", "login"],
    otpSend: ["auth", "otp-send"],
    otpResend: ["auth", "otp-resend"],
    otpVerify: ["auth", "otp-verify"],
    register: ["auth", "register"],
    logout: ["auth", "logout"],
  },
} as const satisfies Record<string, Record<string, QueryKey>>;
