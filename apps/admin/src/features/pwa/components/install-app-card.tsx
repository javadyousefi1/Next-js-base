"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { DownloadIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { usePwaInstall } from "../hooks/use-pwa-install";

export function InstallAppCard() {
  const t = useTranslations("Settings.pwa");
  const { status, install } = usePwaInstall();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {status === "available" && (
          <Button onClick={install}>
            <DownloadIcon data-icon="inline-start" />
            {t("install")}
          </Button>
        )}
        {status === "installed" && <p>{t("installed")}</p>}
        {status === "ios" && <p>{t("iosHint")}</p>}
        {status === "unavailable" && <p>{t("unavailable")}</p>}
      </CardContent>
    </Card>
  );
}
