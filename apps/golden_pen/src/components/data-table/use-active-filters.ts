"use client";

import { useDataTable } from "@repo/table/data-table-context";
import { useTranslations } from "next-intl";

import { buildActiveFilters, type ActiveFilter } from "./active-filters";

export type ActiveFilterBadge = ActiveFilter & {
  label: string;
  removeLabel: string;
  remove: () => void;
};

/** The removable badges of the search and filters that are set, and "clear all". */
export function useActiveFilters(): { badges: ActiveFilterBadge[]; clearAll: () => void } {
  const t = useTranslations("DataTable");
  const { table, filters } = useDataTable();

  const remove = (badge: ActiveFilter) => {
    if (badge.filterId === null) table.setSearch("");
    else if (badge.option !== null) table.toggleFilterOption(badge.filterId, badge.option);
    else table.setFilter(badge.filterId, null);
  };

  const badges = buildActiveFilters({
    q: table.state.q,
    searchTitle: t("search"),
    values: table.filters,
    filters,
  }).map((badge) => ({
    ...badge,
    label: t("activeFilter", { title: badge.title, value: badge.value }),
    removeLabel: t("removeFilter", { title: badge.title }),
    remove: () => remove(badge),
  }));

  return { badges, clearAll: table.resetFilters };
}
