"use client";

import { Button } from "@repo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { InboxIcon, SearchXIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export type DataTableEmptyTexts = {
  /** Replaces "nothing registered yet" (shown when no filter is set). */
  emptyTitle?: string;
  emptyDescription?: string;
  /** Shown under the text when no filter is set, e.g. a "create" button. */
  emptyAction?: ReactNode;
};

type DataTableEmptyProps = DataTableEmptyTexts & {
  hasFilters: boolean;
  onReset: () => void;
};

/** No rows: either nothing exists yet, or nothing matches the search and filters. */
export function DataTableEmpty({
  hasFilters,
  onReset,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: DataTableEmptyProps) {
  const t = useTranslations("DataTable");

  if (hasFilters) {
    return (
      <Empty className="h-full justify-center">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <SearchXIcon />
          </EmptyMedia>
          <EmptyTitle>{t("empty.title")}</EmptyTitle>
          <EmptyDescription>{t("empty.description")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={onReset}>
            {t("resetFilters")}
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <Empty className="h-full justify-center">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <InboxIcon />
        </EmptyMedia>
        <EmptyTitle>{emptyTitle ?? t("noData.title")}</EmptyTitle>
        {emptyDescription ? <EmptyDescription>{emptyDescription}</EmptyDescription> : null}
      </EmptyHeader>
      {emptyAction ? <EmptyContent>{emptyAction}</EmptyContent> : null}
    </Empty>
  );
}
