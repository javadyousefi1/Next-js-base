"use client";

import { useTranslations } from "next-intl";
import { createSerializer } from "nuqs/server";

import { ROUTES } from "@/config/routes";
import { inviteLinksSearchParams } from "@/features/invite-links/invite-links.search-params";
import { usersSearchParams } from "@/features/users/users.search-params";

import { dashboardCountQuery } from "../api/dashboard.queries";

const usersUrl = createSerializer(usersSearchParams);
const inviteLinksUrl = createSerializer(inviteLinksSearchParams);

export const PENDING_IDENTITY_HREF = usersUrl(ROUTES.users, { identityStatus: "2" });
export const UNUSED_INVITE_LINKS_HREF = inviteLinksUrl(ROUTES.inviteLinks, { isUsed: "false" });

const numberFormat = new Intl.NumberFormat("fa-IR");

const format = (value: number | undefined) =>
  value === undefined ? undefined : numberFormat.format(value);

/** The admin pulse's model: three stat cards (value `undefined` while loading). */
export function useAdminPulse() {
  const t = useTranslations("Dashboard.pulse");
  const users = dashboardCountQuery.useQuery({ count: "users" });
  const pending = dashboardCountQuery.useQuery({ count: "identityPending" });
  const requested = dashboardCountQuery.useQuery({ count: "identityRequested" });
  const unused = dashboardCountQuery.useQuery({ count: "inviteLinksUnused" });

  const pendingTotal =
    pending.data !== undefined && requested.data !== undefined
      ? pending.data + requested.data
      : undefined;

  return [
    {
      id: "users",
      label: t("totalUsers"),
      value: format(users.data),
      isError: users.isError,
      retry: () => void users.refetch(),
      href: undefined,
    },
    {
      id: "identity",
      label: t("pendingIdentity"),
      value: format(pendingTotal),
      isError: pending.isError || requested.isError,
      retry: () => {
        void pending.refetch();
        void requested.refetch();
      },
      href: PENDING_IDENTITY_HREF,
    },
    {
      id: "invite-links",
      label: t("unusedInviteLinks"),
      value: format(unused.data),
      isError: unused.isError,
      retry: () => void unused.refetch(),
      href: UNUSED_INVITE_LINKS_HREF,
    },
  ];
}
