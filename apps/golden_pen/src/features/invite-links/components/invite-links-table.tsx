"use client";

import { DataTableProvider } from "@repo/table/data-table-context";
import { useTranslations } from "next-intl";

import { DataTable } from "@/components/data-table/data-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";

import { useInviteLinksTable } from "../hooks/use-invite-links-table";
import { InviteLinkCreateButton } from "./invite-link-create-button";
import { useInviteLinksColumns } from "./invite-links-columns";
import { useInviteLinksFilters } from "./invite-links-filters";

export function InviteLinksTable() {
  const t = useTranslations("InviteLinks");
  const table = useInviteLinksTable();
  const columns = useInviteLinksColumns();
  const filters = useInviteLinksFilters();

  return (
    // No text search in this API: the toolbar hides the search box, so the placeholder is unused.
    <DataTableProvider table={table} columns={columns} filters={filters} searchPlaceholder="">
      <div className="flex flex-col gap-4">
        <DataTableToolbar search={false} />
        <DataTable emptyTitle={t("empty")} emptyAction={<InviteLinkCreateButton />} />
        <DataTablePagination />
      </div>
    </DataTableProvider>
  );
}
