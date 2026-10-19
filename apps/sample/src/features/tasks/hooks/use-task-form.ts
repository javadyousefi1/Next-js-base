"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { JalaliDate } from "@repo/jalali";
import { useModalClose } from "@repo/ui/hooks/use-modal-close";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";

import { useJalaliPickerProps } from "@/hooks/use-jalali-picker-props";

import { createTaskMutation, updateTaskMutation } from "../api/tasks.queries";
import {
  TASK_STATUSES,
  TITLE_MAX_LENGTH,
  TITLE_MIN_LENGTH,
  taskInputSchema,
  type Task,
  type TaskInput,
  type TaskStatus,
} from "../schemas/task.schema";
import { isoToJalali, jalaliToIso } from "../task-dates";

/** zod messages in task.schema.ts are keys of `Examples.data.validation`. */
const VALIDATION_KEYS = ["titleMin", "titleMax"] as const;

/**
 * The create/edit form inside `modal.open`: react-hook-form + the zod schema the mutation
 * validates with; on success it closes the modal with the saved task (`useModalClose`).
 */
export function useTaskForm(task?: Task) {
  // react-hook-form keeps mutable state in refs; opt this hook out of React Compiler memoization.
  "use no memo";

  const t = useTranslations("Examples.data");
  const close = useModalClose();
  const pickerProps = useJalaliPickerProps();
  const form = useForm<TaskInput>({
    resolver: zodResolver(taskInputSchema),
    defaultValues: {
      title: task?.title ?? "",
      status: task?.status ?? "todo",
      dueDate: task?.dueDate ?? null,
    },
  });
  const create = createTaskMutation.useMutation({ onSuccess: (saved) => close(saved) });
  const update = updateTaskMutation.useMutation({ onSuccess: (saved) => close(saved) });
  const mutation = task ? update : create;

  const submit = form.handleSubmit((values) =>
    task ? update.mutate({ id: task.id, ...values }) : create.mutate(values),
  );
  const titleError = form.formState.errors.title?.message;
  const titleErrorKey = VALIDATION_KEYS.find((key) => key === titleError);
  const [status, dueDate] = useWatch({ control: form.control, name: ["status", "dueDate"] });

  return {
    pickerProps,
    register: form.register,
    titleError: titleErrorKey
      ? t(`validation.${titleErrorKey}`, { min: TITLE_MIN_LENGTH, max: TITLE_MAX_LENGTH })
      : undefined,
    statuses: TASK_STATUSES.map((value) => ({ value, label: t(`status.${value}`) })),
    status,
    setStatus: (value: TaskStatus | null) => {
      if (value) form.setValue("status", value, { shouldDirty: true });
    },
    dueDate: dueDate ? isoToJalali(dueDate) : undefined,
    setDueDate: (value: JalaliDate) =>
      form.setValue("dueDate", jalaliToIso(value), { shouldDirty: true }),
    clearDueDate: () => form.setValue("dueDate", null, { shouldDirty: true }),
    formError: mutation.error ? t("form.error", { message: mutation.error.message }) : null,
    isSubmitting: mutation.isPending,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event),
    cancel: () => close(),
  };
}
