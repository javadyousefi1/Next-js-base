"use client";

import { Button } from "@repo/ui/components/button";
import { DialogFooter } from "@repo/ui/components/dialog";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { useTranslations } from "next-intl";

import { usePlanForm } from "../hooks/use-plan-form";

/** Content of `modal.open(<PlanForm />)`. */
export function PlanForm() {
  const t = useTranslations("Modal");
  const tExample = useTranslations("Examples.modal");
  const form = usePlanForm();

  return (
    <>
      <ToggleGroup
        variant="outline"
        value={[form.plan]}
        onValueChange={form.selectPlan}
        aria-label={tExample("open.title")}
      >
        {form.plans.map((plan) => (
          <ToggleGroupItem key={plan.value} value={plan.value}>
            {plan.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <DialogFooter>
        <Button variant="ghost" className="sm:me-auto" onClick={form.showHelp}>
          {tExample("open.help")}
        </Button>
        <Button variant="outline" onClick={form.cancel}>
          {t("cancel")}
        </Button>
        <Button onClick={form.choose}>{tExample("open.choose")}</Button>
      </DialogFooter>
    </>
  );
}
