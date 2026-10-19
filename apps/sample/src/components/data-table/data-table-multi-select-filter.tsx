"use client";

import { useDataTable } from "@repo/table/data-table-context";
import { listValue } from "@repo/table/filters";
import type { DataTableFilter } from "@repo/table/types";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Field, FieldLabel, FieldLegend, FieldSet } from "@repo/ui/components/field";
import { useId } from "react";

type DataTableMultiSelectFilterProps = {
  filter: Extract<DataTableFilter, { type: "multiSelect" }>;
};

/** Multiple-choice filter: one checkbox per option; none checked = not filtered. */
export function DataTableMultiSelectFilter({ filter }: DataTableMultiSelectFilterProps) {
  const { table } = useDataTable();
  const selected = listValue(table.filters[filter.id] ?? null);
  const idPrefix = useId();

  return (
    <FieldSet>
      <FieldLegend variant="label">{filter.title}</FieldLegend>
      {filter.options.map((option, index) => {
        const id = `${idPrefix}-${index}`;

        return (
          <Field key={option.value} orientation="horizontal">
            <Checkbox
              id={id}
              checked={selected.includes(option.value)}
              onCheckedChange={() => table.toggleFilterOption(filter.id, option.value)}
            />
            <FieldLabel htmlFor={id} className="font-normal">
              {option.label}
            </FieldLabel>
          </Field>
        );
      })}
    </FieldSet>
  );
}
