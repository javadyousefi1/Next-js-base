"use client";

import { useProfileTab } from "../hooks/use-profile-tab";
import { ProfileSkeleton } from "./profile-skeleton";

/** The skeleton sized for the tab in the URL (the page's static fallback assumes the first tab). */
export function ProfileLoading() {
  const { tab } = useProfileTab();

  return <ProfileSkeleton tab={tab} />;
}
