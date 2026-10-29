"use client";

import { useTranslations } from "next-intl";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useIdentityStatusLabel } from "@/features/users/hooks/use-identity-status-label";
import { isKnownRole } from "@/features/users/schemas/user.schema";

import type { ProfileIdentity } from "../schemas/profile.schema";

/** Roles (from the session) and the identity status label shown in the profile's side card. */
export function useProfileSide(identity: ProfileIdentity | null) {
  const t = useTranslations("Users");
  const statusLabel = useIdentityStatusLabel();
  const { user } = useCurrentUser();

  return {
    roles: (user?.roles ?? []).map((role) => (isKnownRole(role) ? t(`roles.${role}`) : role)),
    status: identity ? statusLabel(identity.statusType) : null,
  };
}
