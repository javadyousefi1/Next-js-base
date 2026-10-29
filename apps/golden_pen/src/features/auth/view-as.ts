import { SUPER_ADMIN_ROLE, USER_ROLES, type UserRole } from "@/features/users/schemas/user.schema";

/** Cookie holding the role a real super-admin views the panel as (UI only, readable by JS). */
export const VIEW_AS_COOKIE = "gp_view_as";

/** A cookie value → a known role, else `null` (unknown or forged values are ignored). */
export function parseViewAs(value: string | null | undefined): UserRole | null {
  return USER_ROLES.find((role) => role === value) ?? null;
}

/** The roles the UI acts on: the override when a real super-admin set one, else the real roles. */
export function effectiveRoles(realRoles: readonly string[], viewAs: string | null): string[] {
  const allowed = realRoles.includes(SUPER_ADMIN_ROLE);
  const role = allowed ? parseViewAs(viewAs) : null;
  return role ? [role] : [...realRoles];
}
