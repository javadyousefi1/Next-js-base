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
import { ServerCrashIcon } from "lucide-react";
import { useTranslations } from "next-intl";

type DataTableErrorProps = {
  onRetry: () => void;
};

/** The table's data could not be fetched: message + "try again", inside the table's border. */
export function DataTableError({ onRetry }: DataTableErrorProps) {
  const t = useTranslations("DataTable");
  const tCommon = useTranslations("Common");

  return (
    <div className="rounded-lg border">
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
            <ServerCrashIcon />
          </EmptyMedia>
          <EmptyTitle>{t("error.title")}</EmptyTitle>
          <EmptyDescription>{tCommon("error.description")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={onRetry}>
            {tCommon("retry")}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
