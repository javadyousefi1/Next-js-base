"use client";

import type { DataTableColumn } from "@repo/table/types";
import { Badge } from "@repo/ui/components/badge";
import { useTranslations } from "next-intl";

import { formatPersianDate } from "@/features/users/format-date";

import type { InviteLink, InviteLinkStatus } from "../schemas/invite-link.schema";
import { CopyLinkButton } from "./copy-link-button";

const STATUS_VARIANTS = {
  active: "default",
  used: "secondary",
  expired: "outline",
} as const satisfies Record<InviteLinkStatus, "default" | "secondary" | "outline">;

/** The API has no sorting, so no column is sortable. Empty cells show "—". */
export function useInviteLinksColumns(): DataTableColumn<InviteLink>[] {
  const t = useTranslations("InviteLinks");

  return [
    {
      id: "fullName",
      header: t("columns.fullName"),
      cell: (link) => <span className="font-medium">{link.fullName}</span>,
    },
    {
      id: "phoneNumber",
      header: t("columns.phoneNumber"),
      cell: (link) => (
        <span dir="ltr" className="tabular-nums">
          {link.phoneNumber}
        </span>
      ),
    },
    {
      id: "status",
      header: t("columns.status"),
      cell: (link) => (
        <Badge variant={STATUS_VARIANTS[link.status]}>{t(`status.${link.status}`)}</Badge>
      ),
    },
    {
      id: "link",
      header: t("columns.link"),
      cell: (link) => (
        <div className="flex items-center gap-1">
          <span dir="ltr" className="max-w-48 truncate text-muted-foreground">
            {link.inviteUrl}
          </span>
          <CopyLinkButton url={link.inviteUrl} />
        </div>
      ),
    },
    {
      id: "expiresAt",
      header: t("columns.expiresAt"),
      cell: (link) => formatPersianDate(link.expiresAt),
    },
    {
      id: "usedAt",
      header: t("columns.usedAt"),
      cell: (link) => formatPersianDate(link.usedAt),
    },
    {
      id: "createdAt",
      header: t("columns.createdAt"),
      cell: (link) => formatPersianDate(link.createdAt),
    },
  ];
}
