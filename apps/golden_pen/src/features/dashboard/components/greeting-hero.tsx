"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useTranslations } from "next-intl";

import { useGreeting } from "../hooks/use-greeting";
import { Clock } from "./clock";

/** Time-of-day greeting with the first name, today's tip and the live clock. */
export function GreetingHero() {
  const t = useTranslations("Dashboard");
  const { greeting, tip } = useGreeting();

  return (
    <Card className="bg-linear-to-l from-primary/10 to-card">
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          {greeting === null ? (
            <Skeleton className="h-8 w-56" />
          ) : (
            <h2 data-testid="greeting" className="font-heading text-2xl font-semibold">
              {greeting}
            </h2>
          )}
          {tip === null ? (
            <Skeleton className="h-5 w-72" />
          ) : (
            <p className="text-sm text-muted-foreground">{tip}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">{t("clockLabel")}</span>
          <Clock />
        </div>
      </CardContent>
    </Card>
  );
}
