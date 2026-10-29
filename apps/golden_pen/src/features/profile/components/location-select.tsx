"use client";

import { Field, FieldLabel } from "@repo/ui/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { useId } from "react";

type LocationSelectProps = {
  label: string;
  placeholder: string;
  items: { value: string; label: string }[];
  /** `""` = nothing chosen. */
  value: string;
  onChange: (value: string | null) => void;
  disabled?: boolean;
};

/** A labelled single-choice select for a province or a city. */
export function LocationSelect({
  label,
  placeholder,
  items,
  value,
  onChange,
  disabled,
}: LocationSelectProps) {
  const id = useId();

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={items}
        value={value === "" ? null : value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id={id} className="w-full" aria-label={label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
