"use client";

import { Button } from "@repo/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@repo/ui/components/input-group";
import { SearchIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { DataTableToolbarModel } from "@/lib/table/types";

import { DataTableSelectFilter } from "./data-table-select-filter";

/** Search + filters + reset for any table — driven by the model from `useQueryTable`. */
export function DataTableToolbar(props: DataTableToolbarModel) {
  const t = useTranslations("DataTable");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupInput
          type="search"
          value={props.search}
          placeholder={props.searchPlaceholder}
          aria-label={props.searchPlaceholder}
          onChange={(event) => props.onSearchChange(event.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      {props.filters.map((filter) => (
        <DataTableSelectFilter key={filter.id} filter={filter} />
      ))}

      {props.hasFilters ? (
        <Button variant="ghost" onClick={props.onReset}>
          <XIcon data-icon="inline-start" />
          {t("resetFilters")}
        </Button>
      ) : null}
    </div>
  );
}
