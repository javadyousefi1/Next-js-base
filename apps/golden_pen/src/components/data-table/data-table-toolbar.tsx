"use client";

import { useDebouncedInput } from "@repo/hooks/use-debounced-input";
import { useDataTable } from "@repo/table/data-table-context";
import { Button } from "@repo/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@repo/ui/components/input-group";
import { SearchIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { DataTableFilters } from "./data-table-filters";

/** Search box + "clear filters" + the Filters drawer button at the end. */
export function DataTableToolbar() {
  const t = useTranslations("DataTable");
  const { table, searchPlaceholder } = useDataTable();
  const search = useDebouncedInput(table.state.q, table.setSearch);

  return (
    <div className="flex flex-wrap items-center gap-2">
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

      {table.hasFilters ? (
        <Button variant="ghost" onClick={table.resetFilters}>
          <XIcon data-icon="inline-start" />
          {t("resetFilters")}
        </Button>
      ) : null}

      <DataTableFilters />
    </div>
  );
}
