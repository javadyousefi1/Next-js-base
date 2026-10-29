"use client";

import type { DataTableColumn } from "@repo/table/types";
import { Badge } from "@repo/ui/components/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { useTranslations } from "next-intl";

import { isKnownRole, type User } from "@/features/users/schemas/user.schema";
import { formatJalaliDate } from "@/lib/format-date";

import type { useIdentityActions } from "../hooks/use-identity-actions";
import { IdentityRowActions } from "./identity-row-actions";
import { IdentityStatusBadge } from "./identity-status-badge";

type ColumnsOptions = {
  actions: ReturnType<typeof useIdentityActions>;
  onReview: (user: User) => void;
};

/** Same order as `IDENTITY_REQUESTS_COLUMN_KEYS`. The API has no sorting. Empty cells show "—". */
export function useIdentityRequestsColumns({
  actions,
  onReview,
}: ColumnsOptions): DataTableColumn<User>[] {
  const t = useTranslations("IdentityRequests");
  const tUsers = useTranslations("Users");

  const roleLabel = (role: string) => (isKnownRole(role) ? tUsers(`roles.${role}`) : role);

  return [
    {
      id: "fullName",
      header: t("columns.fullName"),
      cell: (user) => <span className="font-medium">{user.fullName}</span>,
    },
    {
      id: "phoneNumber",
      header: t("columns.phoneNumber"),
      cell: (user) => (
        <span dir="ltr" className="tabular-nums">
          {user.phoneNumber}
        </span>
      ),
    },
    {
      id: "roles",
      header: t("columns.roles"),
      cell: (user) =>
        user.roles.length === 0 ? (
          "—"
        ) : (
          <div className="flex flex-wrap gap-1">
            {user.roles.map((role) => (
              <Badge key={role} variant="secondary">
                {roleLabel(role)}
              </Badge>
            ))}
          </div>
        ),
    },
    {
      id: "identityStatus",
      header: t("columns.identityStatus"),
      cell: (user) => <IdentityStatusBadge status={user.identityStatus} />,
    },
    {
      id: "requestedAt",
      header: t("columns.requestedAt"),
      cell: (user) => formatJalaliDate(user.identityRequestedAt),
    },
    {
      id: "reviewedAt",
      header: t("columns.reviewedAt"),
      cell: (user) => formatJalaliDate(user.identityVerifiedAt),
    },
    {
      id: "message",
      header: t("columns.message"),
      cell: (user) =>
        user.identityMessage ? (
          <Tooltip>
            <TooltipTrigger render={<span className="block max-w-40 truncate" />}>
              {user.identityMessage}
            </TooltipTrigger>
            <TooltipContent>{user.identityMessage}</TooltipContent>
          </Tooltip>
        ) : (
          "—"
        ),
    },
    {
      id: "actions",
      header: t("columns.actions"),
      cell: (user) => <IdentityRowActions user={user} actions={actions} onReview={onReview} />,
    },
  ];
}
