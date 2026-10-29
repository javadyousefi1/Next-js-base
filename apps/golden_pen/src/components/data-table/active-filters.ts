import type { DataTableFilter, FilterValue } from "@repo/table/types";

/** One removable badge: the search text (`filterId` null) or one value of a filter. */
export type ActiveFilter = {
  key: string;
  title: string;
  /** The option's label, or the raw text of a text filter. */
  value: string;
  filterId: string | null;
  /** multiSelect only: the option this badge removes. */
  option: string | null;
};

type Input = {
  q: string;
  searchTitle: string;
  values: Record<string, FilterValue>;
  filters: readonly DataTableFilter[];
};

/** The badges of the set search and filters: one per select/text value, one per multiSelect option. */
export function buildActiveFilters({ q, searchTitle, values, filters }: Input): ActiveFilter[] {
  const badges: ActiveFilter[] = [];
  if (q !== "") {
    badges.push({ key: "q", title: searchTitle, value: q, filterId: null, option: null });
  }

  for (const filter of filters) {
    const value = values[filter.id] ?? null;
    if (value === null) continue;
    const selected = typeof value === "string" ? [value] : value;
    const labelOf = (item: string) =>
      filter.type === "text"
        ? item
        : (filter.options.find((option) => option.value === item)?.label ?? item);

    for (const item of selected) {
      badges.push({
        key: `${filter.id}:${item}`,
        title: filter.title,
        value: labelOf(item),
        filterId: filter.id,
        option: filter.type === "multiSelect" ? item : null,
      });
    }
  }
  return badges;
}
