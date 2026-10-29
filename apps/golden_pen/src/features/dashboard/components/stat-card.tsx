"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { ArrowRightIcon, Link2Icon, ShieldAlertIcon, UsersIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

const KINDS = {
  users: {
    icon: UsersIcon,
    tile: "bg-muted text-foreground",
    glow: "bg-primary/5",
  },
  identity: {
    icon: ShieldAlertIcon,
    tile: "bg-warning/10 text-warning",
    glow: "bg-warning/5",
  },
  "invite-links": {
    icon: Link2Icon,
    tile: "bg-success/10 text-success",
    glow: "bg-success/5",
  },
};

type StatCardProps = {
  kind: keyof typeof KINDS;
  label: string;
  value: string | undefined;
  isError: boolean;
  onRetry: () => void;
  href: string;
};

/** One count of the admin pulse: a skeleton while loading, a compact retry on error, a link to its page. */
export function StatCard({ kind, label, value, isError, onRetry, href }: StatCardProps) {
  const t = useTranslations("Dashboard.pulse");
  const tCommon = useTranslations("Common");
  const { icon: Icon, tile, glow } = KINDS[kind];

  const header = (
    <div className="flex items-center gap-3">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", tile)}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );

  if (isError && value === undefined) {
    return (
      <Card className="rounded-2xl shadow-sm lg:col-span-2">
        <CardContent className="flex flex-col gap-3">
          {header}
          <div className="flex h-9 items-center justify-between gap-2 text-sm text-destructive">
            {t("error")}
            <Button variant="outline" size="sm" onClick={onRetry}>
              {tCommon("retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link
      href={href}
      className="group/stat rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:col-span-2"
    >
      <Card className="relative h-full overflow-hidden rounded-2xl shadow-sm transition-all duration-200 group-hover/stat:-translate-y-0.5 group-hover/stat:shadow-md group-hover/stat:ring-ring/40 motion-reduce:transition-none motion-reduce:group-hover/stat:translate-y-0">
        <div
          aria-hidden
          className={cn("absolute -end-6 -top-6 size-20 rounded-full blur-xl", glow)}
        />
        <CardContent className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-col sm:items-stretch sm:gap-5">
          {header}
          {value !== undefined ? (
            <span
              data-testid="stat-value"
              className="font-heading text-3xl leading-10 font-semibold tabular-nums sm:text-4xl"
            >
              {value}
            </span>
          ) : (
            <Skeleton className="h-10 w-20" />
          )}
          <span className="col-span-2 flex items-center justify-between gap-1 border-t border-border/60 pt-3 text-xs font-medium text-muted-foreground group-hover/stat:text-foreground">
            {t("view")}
            <ArrowRightIcon
              className="size-3.5 transition-transform group-hover/stat:translate-x-0.5 motion-reduce:transition-none rtl:rotate-180 rtl:group-hover/stat:-translate-x-0.5"
              aria-hidden
            />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
