"use client";

import { sessionQuery } from "../api/auth.queries";

/** The signed-in user (`undefined` while loading). */
export function useCurrentUser() {
  const query = sessionQuery.useQuery();
  const user = query.data?.user;

  return {
    user,
    isLoading: query.isPending,
    initials: user ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() : "",
    fullName: user ? `${user.firstName} ${user.lastName}` : "",
  };
}
