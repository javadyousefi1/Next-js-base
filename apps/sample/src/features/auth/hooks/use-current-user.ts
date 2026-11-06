"use client";

import { useSessionQuery } from "../auth.api";

/** The signed-in user (`undefined` while loading). */
export function useCurrentUser() {
  const query = useSessionQuery();
  const user = query.data;

  return {
    user,
    isLoading: query.isPending,
    isError: query.isError,
    initials: user ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase() : "",
    fullName: user ? `${user.firstName} ${user.lastName}` : "",
  };
}
