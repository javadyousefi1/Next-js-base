"use client";

import type { DataTableColumn } from "@repo/table/types";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Checkbox } from "@repo/ui/components/checkbox";
import { cn } from "@repo/ui/lib/utils";
import { PencilIcon, Trash2Icon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import type { useTaskActions } from "../hooks/use-task-actions";
import type { Task, TaskStatus } from "../schemas/task.schema";
import { formatTaskDate } from "../task-dates";

const STATUS_BADGE_VARIANTS = {
  todo: "outline",
  doing: "secondary",
  done: "default",
} as const satisfies Record<TaskStatus, "default" | "secondary" | "outline">;

/** Column ids are the API sort fields (`TASK_SORT_FIELDS`); actions come from `useTaskActions`. */
export function useTasksColumns(
  actions: ReturnType<typeof useTaskActions>,
): DataTableColumn<Task>[] {
  const t = useTranslations("Examples.data");
  const locale = useLocale();

  return [
    {
      id: "done",
      header: t("columns.done"),
      cell: (task) => (
        <Checkbox
          checked={task.status === "done"}
          disabled={actions.isUpdating(task)}
          onCheckedChange={() => actions.toggleDone(task)}
          aria-label={t("toggleDone", { title: task.title })}
        />
      ),
    },
    {
      id: "title",
      header: t("columns.title"),
      sortable: true,
      cell: (task) => (
        <span
          className={cn(
            "font-medium",
            task.status === "done" && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </span>
      ),
    },
    {
      id: "status",
      header: t("columns.status"),
      sortable: true,
      cell: (task) => (
        <Badge variant={STATUS_BADGE_VARIANTS[task.status]}>{t(`status.${task.status}`)}</Badge>
      ),
    },
    {
      id: "dueDate",
      header: t("columns.dueDate"),
      sortable: true,
      cell: (task) => (task.dueDate ? formatTaskDate(task.dueDate, locale) : "—"),
    },
    {
      id: "createdAt",
      header: t("columns.createdAt"),
      sortable: true,
      cell: (task) => formatTaskDate(task.createdAt, locale),
    },
    {
      id: "actions",
      header: t("columns.actions"),
      cell: (task) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("edit", { title: task.title })}
            onClick={() => actions.edit(task)}
          >
            <PencilIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("delete.label", { title: task.title })}
            onClick={() => actions.remove(task)}
          >
            <Trash2Icon />
          </Button>
        </div>
      ),
    },
  ];
}
