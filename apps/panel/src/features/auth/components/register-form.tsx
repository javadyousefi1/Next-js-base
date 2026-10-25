"use client";

import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useTranslations } from "next-intl";

import { useRegisterForm } from "../hooks/use-register-form";
import { OtpVerifyForm } from "./otp-verify-form";

/** Registration: first name, last name, phone, then the SMS code that signs the user in. */
export function RegisterForm() {
  const t = useTranslations("Auth");
  const form = useRegisterForm();

  if (form.sentTo) {
    return <OtpVerifyForm phoneNumber={form.sentTo} onChangeNumber={form.changeNumber} />;
  }

  return (
    <form method="post" noValidate onSubmit={form.onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(form.errors.firstName)}>
          <FieldLabel htmlFor="register-first-name">{t("firstName")}</FieldLabel>
          <Input
            id="register-first-name"
            autoComplete="given-name"
            aria-invalid={Boolean(form.errors.firstName)}
            {...form.register("firstName")}
          />
          <FieldError>{form.errors.firstName}</FieldError>
        </Field>
        <Field data-invalid={Boolean(form.errors.lastName)}>
          <FieldLabel htmlFor="register-last-name">{t("lastName")}</FieldLabel>
          <Input
            id="register-last-name"
            autoComplete="family-name"
            aria-invalid={Boolean(form.errors.lastName)}
            {...form.register("lastName")}
          />
          <FieldError>{form.errors.lastName}</FieldError>
        </Field>
        <Field data-invalid={Boolean(form.errors.phoneNumber)}>
          <FieldLabel htmlFor="register-phone">{t("phone")}</FieldLabel>
          <Input
            id="register-phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            aria-invalid={Boolean(form.errors.phoneNumber)}
            {...form.register("phoneNumber")}
          />
          <FieldError>{form.errors.phoneNumber}</FieldError>
        </Field>
      </FieldGroup>

      {form.formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{form.formError}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" disabled={form.isSubmitting}>
        {form.isSubmitting ? <Spinner data-icon="inline-start" /> : null}
        {form.isSubmitting ? t("registering") : t("register")}
      </Button>
    </form>
  );
}
