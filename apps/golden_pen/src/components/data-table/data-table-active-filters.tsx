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

  // The row always takes its height and never wraps (it scrolls sideways): adding the first
  // badge does not push the table down.
  return (
    <div className="flex h-7 items-center gap-2 overflow-x-auto">
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
