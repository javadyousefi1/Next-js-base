"use client";

import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useTranslations } from "next-intl";

import { useOtpLogin } from "../hooks/use-otp-login";
import { OtpVerifyForm } from "./otp-verify-form";

/** Login with an SMS code: phone number, then the code. */
export function OtpLoginForm() {
  const t = useTranslations("Auth");
  const login = useOtpLogin();

  if (login.sentTo) {
    return <OtpVerifyForm phoneNumber={login.sentTo} onChangeNumber={login.changeNumber} />;
  }

  return (
    <form method="post" noValidate onSubmit={login.onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(login.phoneError)}>
          <FieldLabel htmlFor="otp-login-phone">{t("phone")}</FieldLabel>
          <Input
            id="otp-login-phone"
            type="tel"
            inputMode="tel"
            dir="ltr"
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            aria-invalid={Boolean(login.phoneError)}
            {...login.register("phoneNumber")}
          />
          <FieldError>{login.phoneError}</FieldError>
        </Field>
      </FieldGroup>

      {login.formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{login.formError}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" disabled={login.isSubmitting}>
        {login.isSubmitting ? <Spinner data-icon="inline-start" /> : null}
        {login.isSubmitting ? t("sendingCode") : t("sendCode")}
      </Button>
    </form>
  );
}
