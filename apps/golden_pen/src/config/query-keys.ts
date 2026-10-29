import type { QueryKey } from "@tanstack/react-query";

import type { CitiesParams } from "@/features/base-info/schemas/base-info.schema";
import type { DashboardCountParams } from "@/features/dashboard/schemas/dashboard.schema";
import type {
  IdentityDetailParams,
  IdentityRequestsListParams,
} from "@/features/identity-requests/schemas/identity-requests.schema";
import type { InviteLinksListParams } from "@/features/invite-links/schemas/invite-link.schema";
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
const inviteLinksRoot = ["invite-links"] as const;
const identityRequestsRoot = ["identity-requests"] as const;
const profileRoot = ["profile"] as const;
const baseInfoRoot = ["base-info"] as const;
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
  },
  inviteLinks: {
    all: inviteLinksRoot,
    lists: () => [...inviteLinksRoot, "list"] as const,
    list: (params: InviteLinksListParams) => [...inviteLinksRoot, "list", params] as const,
  },
  identityRequests: {
    all: identityRequestsRoot,
    lists: () => [...identityRequestsRoot, "list"] as const,
    list: (params: IdentityRequestsListParams) =>
      [...identityRequestsRoot, "list", params] as const,
    detail: (params: IdentityDetailParams) => [...identityRequestsRoot, "detail", params] as const,
  },
  profile: {
    all: profileRoot,
    detail: () => [...profileRoot, "detail"] as const,
  },
  dashboard: {
    all: dashboardRoot,
    count: (params: DashboardCountParams) => [...dashboardRoot, "count", params] as const,
  },
  baseInfo: {
    all: baseInfoRoot,
    provinces: () => [...baseInfoRoot, "provinces"] as const,
    cities: (params: CitiesParams) => [...baseInfoRoot, "cities", params] as const,
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
  inviteLinks: {
    create: ["invite-links", "create"],
  },
  identityRequests: {
    act: ["identity-requests", "act"],
  },
  profile: {
    updateInfo: ["profile", "update-info"],
    updateIdentity: ["profile", "update-identity"],
    upload: ["profile", "upload"],
  },
} as const satisfies Record<string, Record<string, QueryKey>>;
