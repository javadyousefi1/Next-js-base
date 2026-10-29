"use client";

import { Badge } from "@repo/ui/components/badge";
import { XIcon } from "lucide-react";

import { useViewAsBadge } from "../hooks/use-view-as-badge";

/** Header indicator of an active «نمایش به‌عنوان» override, with an × to reset it. */
export function ViewAsBadge() {
  const badge = useViewAsBadge();

  if (!badge.text) return null;

  return (
    <Badge
      variant="outline"
      className="border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-300"
      data-testid="view-as-badge"
    >
      {badge.text}
      <button
        type="button"
        aria-label={badge.resetLabel}
        className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={badge.clear}
      >
        <XIcon />
      </button>
    </Badge>
  );
}
