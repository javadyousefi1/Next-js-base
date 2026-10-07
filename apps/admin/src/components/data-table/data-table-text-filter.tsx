"use client";

import { useDebouncedInput } from "@repo/hooks/use-debounced-input";
import { useDataTable } from "@repo/table/data-table-context";
import { singleValue } from "@repo/table/filters";
import type { DataTableFilter } from "@repo/table/types";
import { Field, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { useId } from "react";

type DataTableTextFilterProps = {
  filter: Extract<DataTableFilter, { type: "text" }>;
};

/** Free-text filter: typing shows at once, the table updates after a short pause. */
export function DataTableTextFilter({ filter }: DataTableTextFilterProps) {
  const { table } = useDataTable();
  const text = useDebouncedInput(singleValue(table.filters[filter.id] ?? null) ?? "", (value) =>
    table.setFilter(filter.id, value),
  );
  const id = useId();

  return (
    <Field>
      <FieldLabel htmlFor={id}>{filter.title}</FieldLabel>
      <Input
        id={id}
        value={text.value}
        placeholder={filter.placeholder}
        onChange={(event) => text.onChange(event.target.value)}
        onBlur={text.onBlur}
      />
    </Field>
  );
}
