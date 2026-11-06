"use client";

import { useTranslations } from "next-intl";

import { DataTableView } from "@/components/data-table/data-table-view";

import { useUsersTable } from "../hooks/use-users-table";
import { useUsersColumns } from "./users-columns";
import { useUsersFilters } from "./users-filters";

export function UsersTable() {
  const t = useTranslations("Users");

  return (
    <DataTableView
      table={useUsersTable()}
      columns={useUsersColumns()}
      filters={useUsersFilters()}
      searchPlaceholder={t("searchPlaceholder")}
    />
  );
}
