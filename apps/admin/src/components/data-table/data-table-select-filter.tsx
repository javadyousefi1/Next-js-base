"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useTranslations } from "next-intl";

import type { DataTableFilterModel } from "@/lib/table/types";

type DataTableSelectFilterProps = {
  filter: DataTableFilterModel;
};

/** One select filter of the toolbar; `null` = no filter ("Role: All"). */
export function DataTableSelectFilter({ filter }: DataTableSelectFilterProps) {
  const t = useTranslations("DataTable");
  const items = [{ value: null, label: t("anyValue", { title: filter.title }) }, ...filter.options];

  return (
    <Select items={items} value={filter.value} onValueChange={filter.onChange}>
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
