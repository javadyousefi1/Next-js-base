"use client";

import { useSessionRoles } from "@/features/auth/hooks/use-session-roles";
import { SUPER_ADMIN_ROLE } from "@/features/users/schemas/user.schema";

/** Only a super-admin verifies, rejects or revokes (the API answers 403 to anyone else). */
export function useCanReview() {
  const { roles } = useSessionRoles();
  return roles.includes(SUPER_ADMIN_ROLE);
}
