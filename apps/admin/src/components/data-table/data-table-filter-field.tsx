"use client";

import type { DataTableFilter } from "@repo/table/types";

import { DataTableMultiSelectFilter } from "./data-table-multi-select-filter";
import { DataTableSelectFilter } from "./data-table-select-filter";
import { DataTableTextFilter } from "./data-table-text-filter";

type DataTableFilterFieldProps = {
  filter: DataTableFilter;
};

/** One field of the Filters drawer, picked by the filter's `type`. */
export function DataTableFilterField({ filter }: DataTableFilterFieldProps) {
  switch (filter.type) {
    case "select":
      return <DataTableSelectFilter filter={filter} />;
    case "multiSelect":
      return <DataTableMultiSelectFilter filter={filter} />;
    case "text":
      return <DataTableTextFilter filter={filter} />;
    default:
      return null;
  }
}
