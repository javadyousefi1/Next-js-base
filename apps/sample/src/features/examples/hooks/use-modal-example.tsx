"use client";

import { modal, type ModalVariant } from "@repo/ui/lib/modal";
import { useTranslations } from "next-intl";
import { type ReactNode, useState } from "react";

import type { Plan } from "./use-plan-form";

const VARIANTS: readonly ModalVariant[] = ["default", "info", "success", "warning", "destructive"];

/** Stands in for a real request (`await buySubscription(...)`) in this demo. */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Runs an async handler from an event without leaking its promise to React. */
const run =
  <Args extends unknown[]>(task: (...args: Args) => Promise<void>) =>
  (...args: Args) => {
    void task(...args);
  };

/**
 * Every kind of `modal.*` call; each one awaits the answer and shows it as the result.
 * `planForm` is the content of the custom modal (views are created by the view, not the hook).
 */
export function useModalExample({ planForm }: { planForm: ReactNode }) {
  const t = useTranslations("Examples.modal");
  const [result, setResult] = useState<string>();

  return {
    result,
    variants: VARIANTS.map((variant) => ({ variant, label: t(`variants.${variant}`) })),

    confirm: run(async (variant: ModalVariant) => {
      const answer = await modal.confirm(t("confirmText"), {
        variant,
        title: t("confirmTitle", { variant: t(`variants.${variant}`) }),
      });
      setResult(t("answered", { answer }));
    }),

    deleteGroup: run(async () => {
      const answer = await modal.confirm(
        t.rich("delete.text", { name: "Alpha", b: (chunks) => <b>{chunks}</b> }),
        {
          variant: "destructive",
          title: t("delete.title"),
          actionButton: { type: "destructive", label: t("delete.action") },
        },
      );
      if (answer !== "yes") {
        setResult(t("answered", { answer }));
        return;
      }
      setResult(t("deleted"));
    }),

    activateTrial: run(async (failOnce: boolean) => {
      let attempts = 0;
      const answer = await modal.confirm(t.rich("trial.text", { br: () => <br /> }), {
        variant: "success",
        title: t("trial.title"),
        actionButton: t("trial.action"),
        onAction: async (action) => {
          if (action !== "yes") return "no";
          attempts += 1;
          await wait(1200);
          if (failOnce && attempts === 1) throw new Error(t("trial.failed"));
          return "yes";
        },
      });
      setResult(t("answered", { answer }));
    }),

    alert: run(async () => {
      await modal.alert(t("alert.text"), { variant: "success", title: t("alert.title") });
      setResult(t("closed"));
    }),

    rename: run(async () => {
      const name = await modal.prompt(t("prompt.text"), {
        title: t("prompt.title"),
        label: t("prompt.label"),
        defaultValue: "Alpha",
        actionButton: t("prompt.action"),
        validate: (value) => (value.trim().length < 3 ? t("prompt.tooShort") : undefined),
      });
      setResult(name === null ? t("cancelled") : t("renamed", { name }));
    }),

    /** The form closes the modal with `useModalClose()`; its value resolves `modal.open`. */
    choosePlan: run(async () => {
      const plan = await modal.open<Plan>(planForm, {
        title: t("open.title"),
        description: t("open.description"),
      });
      setResult(plan ? t("picked", { plan: t(`plans.${plan}`) }) : t("cancelled"));
    }),
  };
}
