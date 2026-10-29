"use client";

import { Button } from "@repo/ui/components/button";
import { DialogFooter } from "@repo/ui/components/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useTranslations } from "next-intl";

import { useInviteLinkForm } from "../hooks/use-invite-link-form";
import { InviteLinkCreated } from "./invite-link-created";

/** The create form, then the result view; rendered inside `modal.open` by `useInviteLinkActions`. */
export function InviteLinkForm() {
  const t = useTranslations("InviteLinks");
  const tModal = useTranslations("Modal");
  const form = useInviteLinkForm();

  if (form.created) return <InviteLinkCreated inviteUrl={form.created.inviteUrl} />;

  return (
    <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-4">
      <FieldGroup>
        <Field data-invalid={form.errors.firstName ? true : undefined}>
          <FieldLabel htmlFor="invite-first-name">{t("form.firstName")}</FieldLabel>
          <Input
            id="invite-first-name"
            aria-invalid={form.errors.firstName ? true : undefined}
            {...form.register("firstName")}
          />
          {form.errors.firstName && <FieldError>{form.errors.firstName}</FieldError>}
        </Field>
        <Field data-invalid={form.errors.lastName ? true : undefined}>
          <FieldLabel htmlFor="invite-last-name">{t("form.lastName")}</FieldLabel>
          <Input
            id="invite-last-name"
            aria-invalid={form.errors.lastName ? true : undefined}
            {...form.register("lastName")}
          />
          {form.errors.lastName && <FieldError>{form.errors.lastName}</FieldError>}
        </Field>
        <Field data-invalid={form.errors.phoneNumber ? true : undefined}>
          <FieldLabel htmlFor="invite-phone">{t("form.phoneNumber")}</FieldLabel>
          <Input
            id="invite-phone"
            dir="ltr"
            inputMode="tel"
            placeholder="09123456789"
            aria-invalid={form.errors.phoneNumber ? true : undefined}
            {...form.register("phoneNumber")}
          />
          {form.errors.phoneNumber && <FieldError>{form.errors.phoneNumber}</FieldError>}
        </Field>
        <Field data-invalid={form.errors.expiresInDays ? true : undefined}>
          <FieldLabel htmlFor="invite-expires">{t("form.expiresInDays")}</FieldLabel>
          <Input
            id="invite-expires"
            dir="ltr"
            inputMode="numeric"
            aria-invalid={form.errors.expiresInDays ? true : undefined}
            {...form.register("expiresInDays")}
          />
          <FieldDescription>{t("form.expiresHint")}</FieldDescription>
          {form.errors.expiresInDays && <FieldError>{form.errors.expiresInDays}</FieldError>}
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
          {t("form.create")}
        </Button>
      </DialogFooter>
    </form>
  );
}
