"use client";

import type { DataTableFilter } from "@repo/table/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useTranslations } from "next-intl";

type DataTableSelectFilterProps = {
  filter: DataTableFilter;
  value: string | null;
  onChange: (value: string | null) => void;
};

/** Single-choice filter; `null` = not filtered ("Role: All"). */
export function DataTableSelectFilter({ filter, value, onChange }: DataTableSelectFilterProps) {
  const t = useTranslations("DataTable");
  const items = [{ value: null, label: t("anyValue", { title: filter.title }) }, ...filter.options];

  return (
    <Select items={items} value={value} onValueChange={onChange}>
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
