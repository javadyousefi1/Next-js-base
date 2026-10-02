"use client";

import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRefreshStats } from "../hooks/use-refresh-stats";

export function RefreshStatsButton() {
  const t = useTranslations("Dashboard");
  const { refresh, isRefreshing } = useRefreshStats();

  return (
    <Button variant="outline" onClick={refresh} disabled={isRefreshing}>
      <RefreshCwIcon data-icon="inline-start" className={cn(isRefreshing && "animate-spin")} />
      {t("refresh")}
    </Button>
  );
}
