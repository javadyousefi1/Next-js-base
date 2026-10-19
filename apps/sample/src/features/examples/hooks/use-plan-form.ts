"use client";

import { useModalClose } from "@repo/ui/hooks/use-modal-close";
import { modal } from "@repo/ui/lib/modal";
import { useTranslations } from "next-intl";
import { useState } from "react";

export const PLANS = ["free", "pro", "team"] as const;
export type Plan = (typeof PLANS)[number];

/** The plan form shown by `modal.open`: closes the modal with the chosen plan. */
export function usePlanForm() {
  const t = useTranslations("Examples.modal");
  const close = useModalClose();
  const [plan, setPlan] = useState<Plan>("pro");

  return {
    plans: PLANS.map((value) => ({ value, label: t(`plans.${value}`) })),
    plan,
    /** ToggleGroup values are arrays; an empty one (unselect) keeps the current plan. */
    selectPlan: (values: string[]) => {
      const next = PLANS.find((value) => value === values[0]);
      if (next) setPlan(next);
    },
    choose: () => close(plan),
    cancel: () => close(),
    /** A second modal on top of this one. */
    showHelp: () => {
      void modal.alert(t("open.helpText"), { variant: "info", title: t("open.helpTitle") });
    },
  };
}
