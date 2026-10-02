"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import type { Column, RowData } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import type { DataTableFeatures } from "@/lib/table/features";

type DataTableSelectFilterProps<TData extends RowData> = {
  column: Column<DataTableFeatures, TData>;
};

/** Single-choice filter for a column with `meta.filter` ("Role: All" = no filter). */
export function DataTableSelectFilter<TData extends RowData>({
  column,
}: DataTableSelectFilterProps<TData>) {
  const t = useTranslations("DataTable");
  const filter = column.columnDef.meta?.filter;
  if (!filter) return null;

  const value = column.getFilterValue();
  const items = [{ value: null, label: t("anyValue", { title: filter.title }) }, ...filter.options];

  return (
    <Select
      items={items}
      value={typeof value === "string" ? value : null}
      onValueChange={(next) => column.setFilterValue(next ?? undefined)}
    >
      <SelectTrigger className="w-44" aria-label={filter.title}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value ?? ""} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
