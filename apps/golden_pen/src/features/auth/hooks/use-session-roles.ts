"use client";

import { useEffect, useSyncExternalStore } from "react";

import { SUPER_ADMIN_ROLE } from "@/features/users/schemas/user.schema";

import { effectiveRoles } from "../view-as";
import { readViewAs, subscribeViewAs, writeViewAs } from "../view-as-cookie";
import { useCurrentUser } from "./use-current-user";

/**
 * The roles every role-based UI decision uses. `roles` is the effective set (the «نمایش به‌عنوان»
 * override of a real super-admin, else the real roles); `isRealSuperAdmin` ignores the override.
 */
export function useSessionRoles() {
  const { user } = useCurrentUser();
  const stored = useSyncExternalStore(subscribeViewAs, readViewAs, () => null);
  const realRoles = user?.roles ?? [];
  const isRealSuperAdmin = realRoles.includes(SUPER_ADMIN_ROLE);
  const viewAs = isRealSuperAdmin ? stored : null;

  // A leftover or forged cookie of someone who is not a super-admin is removed.
  useEffect(() => {
    if (user && !isRealSuperAdmin && stored) writeViewAs(null);
  }, [user, isRealSuperAdmin, stored]);

  return {
    realRoles,
    roles: effectiveRoles(realRoles, viewAs),
    isRealSuperAdmin,
    viewAs,
    setViewAs: writeViewAs,
    clearViewAs: () => writeViewAs(null),
  };
}
