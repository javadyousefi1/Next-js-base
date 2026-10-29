"use client";

import { useTableState } from "@repo/table/use-table-state";

import { DataTableToolbarHost } from "@/components/data-table/data-table-toolbar-host";

import { inviteLinksSearchParams } from "../invite-links.search-params";
import { useInviteLinksFilters } from "./invite-links-filters";

/** The Filters button and active-filter badges of the invite links table (no search box in this API). */
export function InviteLinksToolbar() {
  const controls = useTableState(inviteLinksSearchParams);
  const filters = useInviteLinksFilters();

  return (
    <DataTableToolbarHost
      controls={controls}
      filters={filters}
      searchPlaceholder=""
      search={false}
    />
  );
}
