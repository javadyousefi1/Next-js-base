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
    tile: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
    glow: "bg-sky-500/10",
  },
  identity: {
    icon: ShieldAlertIcon,
    tile: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    glow: "bg-amber-500/10",
  },
  "invite-links": {
    icon: Link2Icon,
    tile: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    glow: "bg-emerald-500/10",
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
      <Card className="lg:col-span-2">
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
      className="group/stat rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:col-span-2"
    >
      <Card className="relative h-full transition-all duration-200 group-hover/stat:-translate-y-0.5 group-hover/stat:shadow-lg motion-reduce:transition-none motion-reduce:group-hover/stat:translate-y-0">
        <div
          aria-hidden
          className={cn("absolute -end-6 -top-6 size-20 rounded-full blur-xl", glow)}
        />
        <CardContent className="relative flex flex-col gap-3">
          {header}
          {value !== undefined ? (
            <span
              data-testid="stat-value"
              className="font-heading text-3xl leading-9 font-semibold"
            >
              {value}
            </span>
          ) : (
            <Skeleton className="h-9 w-20" />
          )}
          <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover/stat:text-foreground">
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
