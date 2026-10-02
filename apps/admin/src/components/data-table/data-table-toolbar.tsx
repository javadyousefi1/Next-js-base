"use client";

import { Button } from "@repo/ui/components/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@repo/ui/components/input-group";
import type { RowData } from "@tanstack/react-table";
import { SearchIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  isTableFiltered,
  resetTableFilters,
  type DataTableInstance,
} from "@/lib/table/use-data-table";

import { DataTableSelectFilter } from "./data-table-select-filter";

type DataTableToolbarProps<TData extends RowData> = {
  table: DataTableInstance<TData>;
  searchPlaceholder: string;
};

/**
 * Search box (table global filter) + one select per column that declares `meta.filter` + reset.
 * Everything is read from and written to `table` — nothing feature-specific here.
 */
export function DataTableToolbar<TData extends RowData>({
  table,
  searchPlaceholder,
}: DataTableToolbarProps<TData>) {
  const t = useTranslations("DataTable");
  const filterColumns = table.getAllLeafColumns().filter((column) => column.columnDef.meta?.filter);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <InputGroup className="w-full sm:max-w-xs">
        <InputGroupInput
          type="search"
          value={String(table.state.globalFilter ?? "")}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
      </InputGroup>

      {filterColumns.map((column) => (
        <DataTableSelectFilter key={column.id} column={column} />
      ))}

      {isTableFiltered(table) ? (
        <Button variant="ghost" onClick={() => resetTableFilters(table)}>
          <XIcon data-icon="inline-start" />
          {t("resetFilters")}
        </Button>
      ) : null}
    </div>
  );
}
