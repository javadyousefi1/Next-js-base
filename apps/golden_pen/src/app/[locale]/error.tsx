"use client";

import { Button } from "@repo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { useTranslations } from "next-intl";

import { useReportError } from "@/hooks/use-report-error";

/** Route error boundary: unexpected render errors (expected API errors are handled by views). */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Common");
  const { code } = useReportError(error);

  return (
    <main className="flex min-h-[60svh] items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("error.title")}</EmptyTitle>
          <EmptyDescription>{t("error.description")}</EmptyDescription>
          <EmptyDescription>
            {t("error.code")} <bdi dir="ltr">{code}</bdi>
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={reset}>
            {t("retry")}
          </Button>
        </EmptyContent>
      </Empty>
    </main>
  );
}
