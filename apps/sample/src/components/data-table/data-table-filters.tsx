"use client";

import { useDataTable } from "@repo/table/data-table-context";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { useDirection } from "@repo/ui/components/direction";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/sheet";
import { SlidersHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { DataTableFilterField } from "./data-table-filter-field";

/**
 * "Filters" button (with the number of active filters) that opens a side drawer with one field
 * per filter. Changes apply at once. The drawer opens on the button's side: right in LTR, left in RTL.
 */
export function DataTableFilters() {
  const t = useTranslations("DataTable");
  const direction = useDirection();
  const { table, filters } = useDataTable();

  if (filters.length === 0) return null;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="outline"
            className="ms-auto"
            aria-label={t("filtersButton", { count: table.activeFilterCount })}
          />
        }
      >
        <SlidersHorizontalIcon data-icon="inline-start" />
        {t("filters")}
        {table.activeFilterCount > 0 ? (
          <Badge variant="secondary">{table.activeFilterCount}</Badge>
        ) : null}
      </SheetTrigger>
      {/* keepMounted: closing (Escape too) must not drop a text filter's pending commit. */}
      <SheetContent
        side={direction === "rtl" ? "left" : "right"}
        closeLabel={t("close")}
        keepMounted
      >
        <SheetHeader>
          <SheetTitle>{t("filters")}</SheetTitle>
          <SheetDescription>{t("filtersDescription")}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4">
          {filters.map((filter) => (
            <DataTableFilterField key={filter.id} filter={filter} />
          ))}
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            disabled={table.activeFilterCount === 0}
            onClick={table.clearFilters}
          >
            {t("clearAll")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
