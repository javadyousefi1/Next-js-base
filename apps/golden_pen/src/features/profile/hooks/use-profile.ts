"use client";

import { profileQuery } from "../api/profile.queries";

/** The signed-in user with their identity (`undefined` while loading). */
export function useProfile() {
  const query = profileQuery.useQuery();

  return {
    profile: query.data,
    isLoading: query.isPending,
    refetch: () => void query.refetch(),
  };
}
