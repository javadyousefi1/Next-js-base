"use client";

import { isApiError } from "@repo/http";
import { modal } from "@repo/ui/lib/modal";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import { toast } from "sonner";

import type { Task } from "../schemas/task.schema";
import { useDeleteTaskMutation, useRefreshTasks, useUpdateTaskMutation } from "../tasks.api";

type TaskActionsOptions = {
  /** The create/edit form shown by `modal.open`; it closes with the saved task. */
  Form: ComponentType<{ task?: Task }>;
};

/**
 * Row and toolbar actions of the tasks table. No `open` state: every modal is awaited —
 * `modal.open(<Form />)` for create/edit, `modal.confirm` (its `onAction` runs the delete) for
 * delete.
 */
export function useTaskActions({ Form }: TaskActionsOptions) {
  const t = useTranslations("Examples.data");
  const remove = useDeleteTaskMutation();
  const update = useUpdateTaskMutation();
  const refresh = useRefreshTasks();

  const openForm = async (task?: Task) => {
    const saved = await modal.open<Task>(<Form task={task} />, {
      title: t(task ? "form.editTitle" : "form.createTitle"),
      size: "default",
    });
    if (saved) toast.success(t(task ? "toast.updated" : "toast.created", { title: saved.title }));
  };

  const confirmDelete = async (task: Task) => {
    const answer = await modal.confirm(
      t.rich("delete.text", { title: task.title, b: (chunks) => <b>{chunks}</b> }),
      {
        variant: "destructive",
        title: t("delete.title"),
        actionButton: { type: "destructive", label: t("delete.action") },
        onAction: async (action) => {
          if (action !== "yes") return;
          try {
            await remove.mutateAsync({ id: task.id });
          } catch (error) {
            // 422 = a business rule of the API: show a translated reason in the modal.
            throw isApiError(error) && error.code === "VALIDATION"
              ? new Error(t("delete.inProgress"))
              : error;
          }
        },
      },
    );
    if (answer === "yes") toast.success(t("toast.deleted", { title: task.title }));
  };

  return {
    create: () => void openForm(),
    edit: (task: Task) => void openForm(task),
    remove: (task: Task) => void confirmDelete(task),
    /** Checkbox → done / back to todo (the mutation refreshes the list). */
    toggleDone: (task: Task) =>
      update.mutate({
        id: task.id,
        title: task.title,
        dueDate: task.dueDate,
        status: task.status === "done" ? "todo" : "done",
      }),
    isUpdating: (task: Task) => update.isPending && update.variables?.id === task.id,
    /** Refetch every tasks query by key. */
    refresh: () => void refresh(),
  };
}
