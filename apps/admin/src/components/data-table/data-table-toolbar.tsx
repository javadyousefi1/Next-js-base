"use client";

import { Button } from "@repo/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@repo/ui/components/input-group";
import { SearchIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { DataTableFilter, TableControls } from "@/lib/table/types";

import { DataTableSelectFilter } from "./data-table-select-filter";

const NO_FILTERS: DataTableFilter[] = [];

type DataTableToolbarProps = {
  table: TableControls;
  searchPlaceholder: string;
  filters?: DataTableFilter[];
};

/** Search box + one select per filter + "clear filters". */
export function DataTableToolbar({
  table,
  searchPlaceholder,
  filters = NO_FILTERS,
}: DataTableToolbarProps) {
  const t = useTranslations("DataTable");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupInput
          type="search"
          value={table.state.q}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          onChange={(event) => table.setSearch(event.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      {filters.map((filter) => (
        <DataTableSelectFilter
          key={filter.id}
          filter={filter}
          value={table.filters[filter.id] ?? null}
          onChange={(value) => table.setFilter(filter.id, value)}
        />
      ))}

      {table.hasFilters ? (
        <Button variant="ghost" onClick={table.resetFilters}>
          <XIcon data-icon="inline-start" />
          {t("resetFilters")}
        </Button>
      ) : null}
    </div>
  );
}
