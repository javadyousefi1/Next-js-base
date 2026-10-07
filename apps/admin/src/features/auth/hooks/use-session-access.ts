"use client";

import { useCurrentUser } from "./use-current-user";

const NO_ACCESS = { roles: [], permissions: [] } as const;

/**
 * The signed-in user's roles and permissions for `<AccessProvider>`: `null` while loading, and
 * nothing at all when the session cannot be read (least privilege, never "open until loaded").
 */
export function useSessionAccess() {
  const { user, isError } = useCurrentUser();
  if (user) return { roles: user.roles, permissions: user.permissions };
  return isError ? NO_ACCESS : null;
}
