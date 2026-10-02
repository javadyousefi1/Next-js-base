"use client";

import { Button } from "@repo/ui/components/button";
import type { CellData, Column, RowData } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";

import type { DataTableFeatures } from "@/lib/table/features";

const SORT_ICONS = { asc: ArrowUpIcon, desc: ArrowDownIcon, none: ChevronsUpDownIcon };

type DataTableColumnHeaderProps<TData extends RowData, TValue extends CellData> = {
  column: Column<DataTableFeatures, TData, TValue>;
  title: string;
};

/** Sortable column title. Sorting itself is reported to `useDataTable` (URL state). */
export function DataTableColumnHeader<TData extends RowData, TValue extends CellData>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) return <span>{title}</span>;

  const SortIcon = SORT_ICONS[column.getIsSorted() || "none"];

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ms-2.5"
      onClick={column.getToggleSortingHandler()}
    >
      {title}
      <SortIcon data-icon="inline-end" />
    </Button>
  );
}
