"use client";

import type { DataTableFilter } from "@repo/table/types";
import { useTranslations } from "next-intl";

import { TASK_STATUSES } from "../schemas/task.schema";

/** Fields of the Filters drawer. Each `id` is a key of `tasksSearchParams`. */
export function useTasksFilters(): DataTableFilter[] {
  const t = useTranslations("Examples.data");

  return [
    {
      type: "select",
      id: "status",
      title: t("statusFilter"),
      options: TASK_STATUSES.map((status) => ({ value: status, label: t(`status.${status}`) })),
    },
  ];
}
