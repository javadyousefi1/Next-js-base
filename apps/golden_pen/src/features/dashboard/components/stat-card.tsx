"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

type StatCardProps = {
  label: string;
  value: string | undefined;
  isError: boolean;
  onRetry: () => void;
  href?: string;
};

/** One count of the admin pulse: a skeleton while loading, a compact retry on error, a link when it has a page. */
export function StatCard({ label, value, isError, onRetry, href }: StatCardProps) {
  const t = useTranslations("Dashboard.pulse");
  const tCommon = useTranslations("Common");

  const body = (
    <Card className={cn("h-full", href && "transition-colors hover:bg-muted/50")}>
      <CardContent className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        {value !== undefined ? (
          <span className="font-heading text-3xl font-semibold">{value}</span>
        ) : isError ? null : (
          <Skeleton className="h-9 w-16" />
        )}
      </CardContent>
    </Card>
  );

  if (isError && value === undefined) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="flex items-center justify-between gap-2 text-sm text-destructive">
            {t("error")}
            <Button variant="outline" size="sm" onClick={onRetry}>
              {tCommon("retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return href ? (
    <Link
      href={href}
      className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {body}
    </Link>
  ) : (
    body
  );
}
