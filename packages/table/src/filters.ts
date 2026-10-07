import type { FilterValue } from "./types";

/**
 * A raw filter value from the URL state as a `FilterValue`: `""`, `[]` and anything that is not
 * a string or a list of strings mean "not filtered" (`null`).
 */
export function normalizeFilterValue(value: unknown): FilterValue {
  if (typeof value === "string") return value === "" ? null : value;
  if (!Array.isArray(value)) return null;

  const items = value.filter((item): item is string => typeof item === "string");
  return items.length > 0 ? items : null;
}

/** multiSelect: adds `option` when the value does not have it, removes it when it does. */
export function toggleOption(value: FilterValue, option: string): FilterValue {
  const current = typeof value === "string" ? [value] : (value ?? []);
  const next = current.includes(option)
    ? current.filter((item) => item !== option)
    : [...current, option];

  return next.length > 0 ? next : null;
}

/** `select` / `text`: the one value, or `null`. */
export function singleValue(value: FilterValue): string | null {
  return typeof value === "string" ? value : null;
}

/** `multiSelect`: the chosen values (empty when not filtered). */
export function listValue(value: FilterValue): readonly string[] {
  if (value === null) return [];
  return typeof value === "string" ? [value] : value;
}
