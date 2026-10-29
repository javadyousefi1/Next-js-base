"use client";

import { useTableState } from "@repo/table/use-table-state";
import { useTranslations } from "next-intl";

import { DataTableToolbarHost } from "@/components/data-table/data-table-toolbar-host";

import { identityRequestsSearchParams } from "../identity-requests.search-params";
import { useIdentityRequestsFilters } from "./identity-requests-filters";
import { IdentityStatusTabs } from "./identity-status-tabs";

/** Status tabs, search, Filters and the active-filter badges (URL state only, no data). */
export function IdentityRequestsToolbar() {
  const t = useTranslations("IdentityRequests");
  const controls = useTableState(identityRequestsSearchParams);
  const filters = useIdentityRequestsFilters();

  return (
    <div className="flex flex-col gap-3">
      <IdentityStatusTabs />
      <DataTableToolbarHost
        controls={controls}
        filters={filters}
        searchPlaceholder={t("searchPlaceholder")}
      />
    </div>
  );
}
