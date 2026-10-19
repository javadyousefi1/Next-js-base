"use client";

import { permissionsOf, ruleForPath, type AccessRule } from "@repo/access/access";
import { useAccess } from "@repo/access/access-context";
import { useTranslations } from "next-intl";

import { ACCESS_POLICY, PERMISSIONS, ROUTE_ACCESS, type AppPermission } from "@/config/access";
import { ROUTES } from "@/config/routes";
import { USER_ROLES, type UserRole } from "@/features/users/schemas/user.schema";

/** Paths checked against `ROUTE_ACCESS` in the routes card. */
const SAMPLE_PATHS = [ROUTES.dashboard, ROUTES.users, `${ROUTES.users}/42`, ROUTES.examplesData];

/** The signed-in user's access, the policy and the route rules — all through `@repo/access`. */
export function useAccessExample() {
  const t = useTranslations("Examples.access");
  const { isReady, can } = useAccess();
  const describe = (rule: AccessRule<UserRole, AppPermission> | undefined) => {
    if (!rule) return t("routes.sessionOnly");
    if (typeof rule === "string") return rule;
    return `role: ${[rule.role].flat().join(" | ")}`;
  };

  return {
    isReady,
    roles: USER_ROLES.filter((role) => can({ role })),
    permissions: PERMISSIONS.filter((permission) => can(permission)),
    policy: USER_ROLES.map((role) => ({
      role,
      grants: ACCESS_POLICY[role],
      permissions: permissionsOf(ACCESS_POLICY, [role], PERMISSIONS),
    })),
    routes: SAMPLE_PATHS.map((path) => {
      const rule = ruleForPath(ROUTE_ACCESS, path);
      return { path, rule: describe(rule), allowed: isReady && (!rule || can(rule)) };
    }),
  };
}
