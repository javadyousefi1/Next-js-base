"use client";

import { useTableState } from "@repo/table/use-table-state";
import { useTranslations } from "next-intl";

import { DataTableToolbarHost } from "@/components/data-table/data-table-toolbar-host";

import { usersSearchParams } from "../users.search-params";
import { useUsersFilters } from "./users-filters";

/** Search, Filters and the active-filter badges of the users table (URL state only, no data). */
export function UsersToolbar() {
  const t = useTranslations("Users");
  const controls = useTableState(usersSearchParams);
  const filters = useUsersFilters();

  return (
    <DataTableToolbarHost
      controls={controls}
      filters={filters}
      searchPlaceholder={t("searchPlaceholder")}
    />
  );
}
