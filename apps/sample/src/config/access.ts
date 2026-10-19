import type { AccessPolicy, AccessRule } from "@repo/access/access";

import type { UserRole } from "@/features/users/schemas/user.schema";

import { ROUTES, type AppRoute } from "./routes";

/** Every permission in the app: "<area>.<action>". */
export const PERMISSIONS = ["users.read", "stats.refresh"] as const;
export type AppPermission = (typeof PERMISSIONS)[number];

/** Who may do what. A grant is a permission, a whole area (`users.*`) or everything (`*`). */
export const ACCESS_POLICY = {
  admin: ["*"],
  moderator: ["users.*"],
  user: [],
} as const satisfies AccessPolicy<UserRole, AppPermission>;

/**
 * Pages that need more than a session. A key covers its nested pages (`/users` covers
 * `/users/42/edit`), `[param]` matches any value and the most specific key wins. `/` (the
 * dashboard) would cover every page, so the dashboard stays open to every signed-in user.
 */
export const ROUTE_ACCESS: Readonly<
  Partial<Record<AppRoute | `${AppRoute}/${string}`, AccessRule<UserRole, AppPermission>>>
> = {
  [ROUTES.users]: "users.read",
};

// Types `<Can>` and `useAccess()` from @repo/access.
declare module "@repo/access/register" {
  interface Register {
    role: UserRole;
    permission: AppPermission;
  }
}
