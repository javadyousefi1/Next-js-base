"use client";

import { useTranslations } from "next-intl";
import { type MouseEvent, useState } from "react";
import { toast } from "sonner";

const PAGE_COUNT = 5;
const PLANS = ["free", "pro", "team"] as const;

/** The little state the component gallery needs (switch, checkbox, select, pagination…). */
export function useUiExample() {
  const t = useTranslations("Examples.ui");
  const [notifications, setNotifications] = useState(true);
  const [terms, setTerms] = useState(false);
  const [plan, setPlan] = useState<(typeof PLANS)[number]>("pro");
  const [page, setPage] = useState(1);
  const [emailNotifications, setEmailNotifications] = useState(true);

  return {
    notifications: { checked: notifications, onCheckedChange: setNotifications },
    terms: { checked: terms, onCheckedChange: setTerms },
    emailNotifications: { checked: emailNotifications, onCheckedChange: setEmailNotifications },
    plans: PLANS.map((value) => ({ value, label: t(`plans.${value}`) })),
    plan: {
      value: plan,
      onValueChange: (value: string | null) => {
        const next = PLANS.find((candidate) => candidate === value);
        if (next) setPlan(next);
      },
    },
    pagination: {
      page,
      pages: Array.from({ length: PAGE_COUNT }, (_, index) => index + 1),
      hasPrevious: page > 1,
      hasNext: page < PAGE_COUNT,
      /** Pagination renders links; this demo keeps the page in state instead of the URL. */
      goTo: (target: number) => (event: MouseEvent) => {
        event.preventDefault();
        setPage(Math.min(Math.max(target, 1), PAGE_COUNT));
      },
    },
    toast: {
      success: () => toast.success(t("toasts.successText")),
      error: () => toast.error(t("toasts.errorText")),
      info: () => toast.info(t("toasts.infoText")),
    },
  };
}
