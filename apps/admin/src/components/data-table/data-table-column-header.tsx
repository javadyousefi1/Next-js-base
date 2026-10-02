"use client";

import { Button } from "@repo/ui/components/button";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";

import type { SortOrder } from "@/lib/table/search-params";

const SORT_ICONS = { asc: ArrowUpIcon, desc: ArrowDownIcon, none: ChevronsUpDownIcon };

type DataTableColumnHeaderProps = {
  title: string;
  /** Current sort of this column, `null` when the table is not sorted by it. */
  direction: SortOrder | null;
  onSort: () => void;
};

export function DataTableColumnHeader({ title, direction, onSort }: DataTableColumnHeaderProps) {
  const SortIcon = SORT_ICONS[direction ?? "none"];

  return (
    <Button variant="ghost" size="sm" className="-ms-2.5" onClick={onSort}>
      {title}
      <SortIcon data-icon="inline-end" />
    </Button>
  );
}
