"use client";

import { Button } from "@repo/ui/components/button";
import { DialogFooter } from "@repo/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Spinner } from "@repo/ui/components/spinner";
import { Textarea } from "@repo/ui/components/textarea";
import { useTranslations } from "next-intl";

import { useIdentityReasonForm } from "../hooks/use-identity-reason-form";
import type { ReasonAction } from "../schemas/identity-requests.schema";

type IdentityReasonFormProps = {
  action: ReasonAction;
  onSubmit: (message: string) => Promise<void>;
};

/** The reason of a rejection / revocation, rendered inside `modal.open` by `useIdentityActions`. */
export function IdentityReasonForm({ action, onSubmit }: IdentityReasonFormProps) {
  const t = useTranslations("IdentityRequests");
  const tModal = useTranslations("Modal");
  const form = useIdentityReasonForm({ action, onSubmit });

  return (
    <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-4">
      <Field data-invalid={form.error ? true : undefined}>
        <FieldLabel htmlFor="identity-reason">{t("reason.label")}</FieldLabel>
        <Textarea
          id="identity-reason"
          rows={4}
          aria-invalid={form.error ? true : undefined}
          {...form.register("message")}
        />
        {form.error && <FieldError>{form.error}</FieldError>}
      </Field>
      <div className="flex flex-wrap gap-2" aria-label={t("reason.chips")}>
        {form.chips.map((chip) => (
          <Button
            key={chip}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => form.fillReason(chip)}
          >
            {chip}
          </Button>
        ))}
      </div>
      {form.formError && (
        <p role="alert" className="text-sm text-destructive">
          {form.formError}
        </p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={form.cancel}>
          {tModal("cancel")}
        </Button>
        <Button type="submit" variant="destructive" disabled={form.isSubmitting}>
          {form.isSubmitting && <Spinner data-icon="inline-start" />}
          {form.submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
