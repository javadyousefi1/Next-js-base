"use client";

import { sessionQuery } from "@/features/auth/api/auth.queries";

/** The welcome card's model: the signed-in user's name and phone (`undefined` while loading). */
export function useWelcome() {
  const query = sessionQuery.useQuery();

  return {
    isLoading: query.isPending,
    isError: query.isError,
    retry: () => void query.refetch(),
    fullName: query.data?.fullName,
    phoneNumber: query.data?.phoneNumber,
  };
}
