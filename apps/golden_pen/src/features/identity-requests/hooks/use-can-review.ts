"use client";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { SUPER_ADMIN_ROLE } from "@/features/users/schemas/user.schema";

/** Only a super-admin verifies, rejects or revokes (the API answers 403 to anyone else). */
export function useCanReview() {
  const { user } = useCurrentUser();
  return user?.roles.includes(SUPER_ADMIN_ROLE) ?? false;
}
