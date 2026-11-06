"use client";

import { useLocale } from "next-intl";

import { ROUTES } from "@/config/routes";
import { getPathname } from "@/i18n/navigation";

import { useLogoutMutation } from "../auth.api";
import { writeViewAs } from "../view-as-cookie";

export function useLogout() {
  const locale = useLocale();
  const mutation = useLogoutMutation();

  const logout = () =>
    mutation.mutate(undefined, {
      // Full page load (not a client navigation): it wipes everything the previous user had in
      // memory (React Query cache, component state) and no mounted query can refetch in between.
      onSuccess: () => {
        writeViewAs(null);
        window.location.replace(getPathname({ href: ROUTES.login, locale }));
      },
    });

  return { logout, isLoggingOut: mutation.isPending };
}
