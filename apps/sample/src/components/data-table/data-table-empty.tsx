"use client";

import { Button } from "@repo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { useTranslations } from "next-intl";

type DataTableEmptyProps = {
  hasFilters: boolean;
  onReset: () => void;
};

export function DataTableEmpty({ hasFilters, onReset }: DataTableEmptyProps) {
  const t = useTranslations("DataTable");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{t("empty.title")}</EmptyTitle>
        <EmptyDescription>{t("empty.description")}</EmptyDescription>
      </EmptyHeader>
      {hasFilters ? (
        <EmptyContent>
          <Button variant="outline" onClick={onReset}>
            {t("resetFilters")}
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}
