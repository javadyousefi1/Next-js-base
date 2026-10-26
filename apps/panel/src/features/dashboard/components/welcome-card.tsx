"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { useTranslations } from "next-intl";

import { QueryError } from "@/components/feedback/query-error";

import { useWelcome } from "../hooks/use-welcome";

export function WelcomeCard() {
  const t = useTranslations("Dashboard");
  const welcome = useWelcome();

  if (welcome.isError) return <QueryError onRetry={welcome.retry} />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {welcome.fullName ? (
            t("welcome", { name: welcome.fullName })
          ) : (
            <Skeleton className="h-6 w-48" />
          )}
        </CardTitle>
        <CardDescription>{t("welcomeDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm">
        <span className="text-muted-foreground">{t("phone")}: </span>
        {welcome.phoneNumber ? (
          <bdi dir="ltr">{welcome.phoneNumber}</bdi>
        ) : (
          <Skeleton className="inline-block h-4 w-28 align-middle" />
        )}
      </CardContent>
    </Card>
  );
}
