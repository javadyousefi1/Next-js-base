"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRateLimitExample } from "../hooks/use-rate-limit-example";

export function RateLimitCard() {
  const t = useTranslations("Examples.redis");
  const example = useRateLimitExample();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("rateLimit.title")}</CardTitle>
        <CardDescription>{t("rateLimit.description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <Button onClick={example.press} disabled={example.isPending}>
            {example.isPending && <Spinner data-icon="inline-start" />}
            {t("rateLimit.press")}
          </Button>
          <Button variant="outline" onClick={example.reload}>
            <RefreshCwIcon data-icon="inline-start" />
            {t("cache.reload")}
          </Button>
        </div>
        <p
          aria-live="polite"
          className={cn("min-h-5 text-sm", example.blocked && "text-destructive")}
        >
          {example.message}
        </p>
      </CardContent>
    </Card>
  );
}
