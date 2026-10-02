"use client";

import { Button } from "@repo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@repo/ui/components/empty";
import type { RowData } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

import {
  isTableFiltered,
  resetTableFilters,
  type DataTableInstance,
} from "@/lib/table/use-data-table";

export function DataTableEmpty<TData extends RowData>({
  table,
}: {
  table: DataTableInstance<TData>;
}) {
  const t = useTranslations("DataTable");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t("empty.title")}</EmptyTitle>
        <EmptyDescription>{t("empty.description")}</EmptyDescription>
      </EmptyHeader>
      {isTableFiltered(table) ? (
        <EmptyContent>
          <Button variant="outline" onClick={() => resetTableFilters(table)}>
            {t("resetFilters")}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
