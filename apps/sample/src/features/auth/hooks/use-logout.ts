"use client";

import { useLocale } from "next-intl";

import { ROUTES } from "@/config/routes";
import { getPathname } from "@/i18n/navigation";

import { useLogoutMutation } from "../auth.api";

export function useLogout() {
  const locale = useLocale();
  const mutation = useLogoutMutation();
  // Full page load (not a client navigation): it wipes everything the previous user had in
  // memory (React Query cache, component state) and no mounted query can refetch in between.
  const onSuccess = () => window.location.replace(getPathname({ href: ROUTES.login, locale }));

  return {
    logout: () => mutation.mutate(undefined, { onSuccess }),
    isLoggingOut: mutation.isPending,
  };
}
