"use client";

import type { DataTableColumn } from "@repo/table/types";
import { Badge } from "@repo/ui/components/badge";
import { useTranslations } from "next-intl";

import { formatJalaliDate } from "@/lib/format-date";

import { useIdentityStatusLabel } from "../hooks/use-identity-status-label";
import { isKnownRole, type User } from "../schemas/user.schema";

/** The API has no sorting, so no column is sortable. Empty cells show "—". */
export function useUsersColumns(): DataTableColumn<User>[] {
  const t = useTranslations("Users");

  const roleLabel = (role: string) => (isKnownRole(role) ? t(`roles.${role}`) : role);
  const identityLabel = useIdentityStatusLabel();

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
    { id: "email", header: t("columns.email"), cell: (user) => user.email ?? "—" },
    { id: "username", header: t("columns.username"), cell: (user) => user.username ?? "—" },
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
      cell: (user) =>
        user.identityStatus === null ? (
          "—"
        ) : (
          <Badge variant="outline">{identityLabel(user.identityStatus)}</Badge>
        ),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: (user) => (
        <Badge variant={user.isActive ? "default" : "outline"}>
          {user.isActive ? t("status.active") : t("status.inactive")}
        </Badge>
      ),
    },
    {
      id: "phoneVerified",
      header: t("columns.phoneVerified"),
      cell: (user) => (user.isPhoneNumberVerified ? t("yes") : t("no")),
    },
    {
      id: "createdAt",
      header: t("columns.createdAt"),
      cell: (user) => formatJalaliDate(user.createdAt),
    },
  ];
}
