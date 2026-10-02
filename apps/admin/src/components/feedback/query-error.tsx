"use client";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { CircleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";

type QueryErrorProps = {
  onRetry: () => void;
};

/** Standard error state for a failed query (the global toast only covers background refetches). */
export function QueryError({ onRetry }: QueryErrorProps) {
  const t = useTranslations("Common");

  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{t("error.title")}</AlertTitle>
      <AlertDescription>{t("error.description")}</AlertDescription>
      <AlertAction>
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t("retry")}
        </Button>
      </AlertAction>
    </Alert>
  );
}
