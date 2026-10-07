"use client";

import { createContext, use, type ReactNode } from "react";

import { allows, type Access, type AccessRule } from "./access";
import type { Permission, Role } from "./register";

const AccessContext = createContext<Access<Role, Permission> | null>(null);

type AccessProviderProps = {
  /** The signed-in user's access; `null` while the session is still loading. */
  access: Access<Role, Permission> | null;
  children: ReactNode;
};

/** Gives `useAccess()` and `<Can>` the signed-in user's roles and permissions. */
export function AccessProvider({ access, children }: AccessProviderProps) {
  return <AccessContext value={access}>{children}</AccessContext>;
}

/** `can(rule)`: is the rule satisfied? Everything is denied until `isReady` (outside a provider too). */
export function useAccess() {
  const access = use(AccessContext);
  return {
    isReady: access !== null,
    can: (rule: AccessRule<Role, Permission>) => access !== null && allows(access, rule),
  };
}

type CanProps = (
  | { permission: Permission; role?: never }
  | { role: Role | readonly Role[]; permission?: never }
) & {
  /** Shown when access is denied (or not known yet). Nothing by default. */
  fallback?: ReactNode;
  children: ReactNode;
};

/** Renders `children` only when the user has the permission (or one of the roles). */
export function Can(props: CanProps) {
  const { can } = useAccess();
  const { fallback = null, children } = props;
  const rule = props.permission === undefined ? { role: props.role } : props.permission;

  return can(rule) ? children : fallback;
}
