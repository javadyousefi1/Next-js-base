"use client";

import { Button } from "@repo/ui/components/button";
import { DialogFooter } from "@repo/ui/components/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { JalaliDatePicker } from "@repo/ui/components/jalali-date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Spinner } from "@repo/ui/components/spinner";
import { useTranslations } from "next-intl";

import { useTaskForm } from "../hooks/use-task-form";
import type { Task } from "../schemas/task.schema";

/** Create (no `task`) or edit form; rendered inside `modal.open` by `useTaskActions`. */
export function TaskForm({ task }: { task?: Task }) {
  const t = useTranslations("Examples.data");
  const tModal = useTranslations("Modal");
  const tPicker = useTranslations("DatePicker");
  const form = useTaskForm(task);

  return (
    <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={form.titleError ? true : undefined}>
          <FieldLabel htmlFor="task-title">{t("form.title")}</FieldLabel>
          <Input
            id="task-title"
            aria-invalid={form.titleError ? true : undefined}
            {...form.register("title")}
          />
          {form.titleError && <FieldError>{form.titleError}</FieldError>}
        </Field>
        <Field>
          <FieldLabel htmlFor="task-status">{t("form.status")}</FieldLabel>
          <Select items={form.statuses} value={form.status} onValueChange={form.setStatus}>
            <SelectTrigger id="task-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {form.statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="task-due-date">{t("form.dueDate")}</FieldLabel>
          <div className="flex gap-2">
            <JalaliDatePicker
              {...form.pickerProps}
              id="task-due-date"
              placeholder={tPicker("placeholder")}
              value={form.dueDate}
              onChange={form.setDueDate}
            />
            <Button
              type="button"
              variant="ghost"
              disabled={!form.dueDate}
              onClick={form.clearDueDate}
            >
              {t("form.clearDate")}
            </Button>
          </div>
        </Field>
      </FieldGroup>
      {form.formError && (
        <p role="alert" className="text-sm text-destructive">
          {form.formError}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={form.cancel}>
          {tModal("cancel")}
        </Button>
        <Button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting && <Spinner data-icon="inline-start" />}
          {t(task ? "form.save" : "form.create")}
        </Button>
      </DialogFooter>
    </form>
  );
}
