"use client";

import { QueryError } from "@/components/feedback/query-error";

import { useProfile } from "../hooks/use-profile";
import { AvatarCard } from "./avatar-card";
import { DocumentsCard } from "./documents-card";
import { ProfileIdentityForm } from "./profile-identity-form";
import { ProfileInfoForm } from "./profile-info-form";
import { ProfileSkeleton } from "./profile-skeleton";

/** The profile page body: avatar, basic info, identity and documents. */
export function ProfileContent() {
  const { profile, isLoading, refetch } = useProfile();

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return <QueryError onRetry={refetch} />;

  return (
    <div className="flex flex-col gap-4">
      <AvatarCard info={profile.info} />
      <ProfileInfoForm info={profile.info} />
      <ProfileIdentityForm identity={profile.identity} />
      <DocumentsCard identity={profile.identity} />
    </div>
  );
}
