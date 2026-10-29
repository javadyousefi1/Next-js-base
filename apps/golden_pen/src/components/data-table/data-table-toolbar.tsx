"use client";

import { useDebouncedInput } from "@repo/hooks/use-debounced-input";
import { useDataTable } from "@repo/table/data-table-context";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@repo/ui/components/input-group";
import { SearchIcon } from "lucide-react";

import { DataTableActiveFilters } from "./data-table-active-filters";
import { DataTableFilters } from "./data-table-filters";

type DataTableToolbarProps = {
  /** `false` for an API without text search: no search box. */
  search?: boolean;
};

/** Search box + the Filters drawer button at the end, and the active filters as badges below. */
export function DataTableToolbar({ search: showSearch = true }: DataTableToolbarProps) {
  const { table, searchPlaceholder } = useDataTable();
  const search = useDebouncedInput(table.state.q, table.setSearch);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {showSearch ? (
          <InputGroup className="w-full sm:max-w-xs">
            <InputGroupInput
              type="search"
              value={search.value}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onChange={(event) => search.onChange(event.target.value)}
              onBlur={search.onBlur}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        ) : null}

        <DataTableFilters />
      </div>
      <DataTableActiveFilters />
    </div>
  );
}
