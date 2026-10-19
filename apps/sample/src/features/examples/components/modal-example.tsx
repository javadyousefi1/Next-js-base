"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { useTranslations } from "next-intl";

import { useModalExample } from "../hooks/use-modal-example";
import { ExampleResult } from "./example-result";
import { PlanForm } from "./plan-form";

/** `modal.confirm/alert/prompt/open` from `@repo/ui/lib/modal` — no `open` state anywhere. */
export function ModalExample() {
  const t = useTranslations("Examples.modal");
  const example = useModalExample({ planForm: <PlanForm /> });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("confirmCard.title")}</CardTitle>
            <CardDescription>{t("confirmCard.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {example.variants.map(({ variant, label }) => (
              <Button key={variant} variant="outline" onClick={() => example.confirm(variant)}>
                {label}
              </Button>
            ))}
            <Button variant="destructive" onClick={example.deleteGroup}>
              {t("delete.button")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("asyncCard.title")}</CardTitle>
            <CardDescription>{t("asyncCard.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => example.activateTrial(false)}>{t("trial.button")}</Button>
            <Button variant="outline" onClick={() => example.activateTrial(true)}>
              {t("trial.failButton")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("otherCard.title")}</CardTitle>
            <CardDescription>{t("otherCard.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={example.alert}>
              {t("alert.button")}
            </Button>
            <Button variant="outline" onClick={example.rename}>
              {t("prompt.button")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("customCard.title")}</CardTitle>
            <CardDescription>{t("customCard.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={example.choosePlan}>
              {t("open.button")}
            </Button>
          </CardContent>
        </Card>
      </div>
      <ExampleResult value={example.result} />
    </div>
  );
}
