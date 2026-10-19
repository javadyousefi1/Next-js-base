"use client";

import { useDataTable } from "@repo/table/data-table-context";
import { singleValue } from "@repo/table/filters";
import type { DataTableFilter } from "@repo/table/types";
import { Field, FieldLabel } from "@repo/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useTranslations } from "next-intl";
import { useId } from "react";

type DataTableSelectFilterProps = {
  filter: Extract<DataTableFilter, { type: "select" }>;
};

/** Single-choice filter; `null` = not filtered ("All"). */
export function DataTableSelectFilter({ filter }: DataTableSelectFilterProps) {
  const t = useTranslations("DataTable");
  const { table } = useDataTable();
  const items = [{ value: null, label: t("all") }, ...filter.options];
  const id = useId();

  return (
    <Field>
      <FieldLabel htmlFor={id}>{filter.title}</FieldLabel>
      <Select
        items={items}
        value={singleValue(table.filters[filter.id] ?? null)}
        onValueChange={(value) => table.setFilter(filter.id, value)}
      >
        <SelectTrigger id={id} className="w-full" aria-label={filter.title}>
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
    </Field>
  );
}
