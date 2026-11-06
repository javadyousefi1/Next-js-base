"use client";

import { useTranslations } from "next-intl";

import { DataTableView } from "@/components/data-table/data-table-view";

import { useInviteLinksTable } from "../hooks/use-invite-links-table";
import { InviteLinkCreateButton } from "./invite-link-create-button";
import { useInviteLinksColumns } from "./invite-links-columns";
import { useInviteLinksFilters } from "./invite-links-filters";

export function InviteLinksTable() {
  const t = useTranslations("InviteLinks");

  return (
    // No text search in this API: the toolbar hides the search box, so the placeholder is unused.
    <DataTableView
      table={useInviteLinksTable()}
      columns={useInviteLinksColumns()}
      filters={useInviteLinksFilters()}
      searchPlaceholder=""
      emptyTitle={t("empty")}
      emptyAction={<InviteLinkCreateButton />}
    />
  );
}
