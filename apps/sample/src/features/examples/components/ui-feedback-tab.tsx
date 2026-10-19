"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Spinner } from "@repo/ui/components/spinner";
import { CircleAlertIcon, FolderIcon, InfoIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useUiExample } from "../hooks/use-ui-example";
import { GallerySection } from "./gallery-section";

export function UiFeedbackTab() {
  const t = useTranslations("Examples.ui");
  const ui = useUiExample();

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        <Alert>
          <InfoIcon />
          <AlertTitle>{t("alerts.infoTitle")}</AlertTitle>
          <AlertDescription>{t("alerts.info")}</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>{t("alerts.errorTitle")}</AlertTitle>
          <AlertDescription>{t("alerts.error")}</AlertDescription>
        </Alert>
      </div>

      <GallerySection title={t("toasts.title")}>
        <Button variant="outline" onClick={ui.toast.success}>
          {t("toasts.success")}
        </Button>
        <Button variant="outline" onClick={ui.toast.error}>
          {t("toasts.error")}
        </Button>
        <Button variant="outline" onClick={ui.toast.info}>
          {t("toasts.info")}
        </Button>
      </GallerySection>

      <GallerySection title={`${t("display.skeleton")} · Spinner`}>
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Spinner className="size-6" />
      </GallerySection>

      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderIcon />
          </EmptyMedia>
          <EmptyTitle>{t("empty.title")}</EmptyTitle>
          <EmptyDescription>{t("empty.description")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>{t("empty.action")}</Button>
        </EmptyContent>
      </Empty>
    </>
  );
}
