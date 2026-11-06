"use client";

import { useProfileQuery } from "../profile.api";

/** The signed-in user with their identity (`undefined` while loading). */
export function useProfile() {
  const query = useProfileQuery();

  return {
    profile: query.data,
    isLoading: query.isPending,
    refetch: () => void query.refetch(),
  };
}
