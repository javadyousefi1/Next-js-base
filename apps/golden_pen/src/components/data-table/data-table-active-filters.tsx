"use client";

import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useActiveFilters } from "./use-active-filters";

/** One removable badge per active filter value (and the search); "clear all" from two badges on. */
export function DataTableActiveFilters() {
  const t = useTranslations("DataTable");
  const { badges, clearAll } = useActiveFilters();

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {badges.map((badge) => (
        <Badge key={badge.key} variant="secondary" className="gap-1">
          {badge.label}
          <button
            type="button"
            aria-label={badge.removeLabel}
            className="rounded-full hover:text-foreground"
            onClick={badge.remove}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      {badges.length >= 2 ? (
        <Button variant="link" size="sm" onClick={clearAll}>
          {t("clearAll")}
        </Button>
      ) : null}
    </div>
  );
}
