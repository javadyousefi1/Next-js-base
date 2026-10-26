"use client";

import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useTranslations } from "next-intl";

import { useOtpVerify } from "../hooks/use-otp-verify";

type OtpVerifyFormProps = {
  /** The (validated) phone the code was sent to. */
  phoneNumber: string;
  /** Back to the previous step to type another number. */
  onChangeNumber: () => void;
};

/** "Enter the SMS code" step, shared by OTP login and registration. */
export function OtpVerifyForm({ phoneNumber, onChangeNumber }: OtpVerifyFormProps) {
  const t = useTranslations("Auth");
  const otp = useOtpVerify(phoneNumber);

  return (
    <form method="post" noValidate onSubmit={otp.onSubmit} className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        {t("codeSentTo")} <bdi dir="ltr">{phoneNumber}</bdi>
      </p>

      <FieldGroup>
        <Field data-invalid={Boolean(otp.codeError)}>
          <FieldLabel htmlFor="otp-code">{t("code")}</FieldLabel>
          <Input
            id="otp-code"
            inputMode="numeric"
            dir="ltr"
            autoComplete="one-time-code"
            aria-invalid={Boolean(otp.codeError)}
            {...otp.register("code")}
          />
          <FieldError>{otp.codeError}</FieldError>
        </Field>
      </FieldGroup>

      {otp.formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{otp.formError}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" disabled={otp.isSubmitting}>
        {otp.isSubmitting ? <Spinner data-icon="inline-start" /> : null}
        {otp.isSubmitting ? t("verifying") : t("verify")}
      </Button>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onChangeNumber}>
          {t("changeNumber")}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!otp.canResend}
          onClick={otp.resendCode}
        >
          {otp.secondsLeft > 0 ? t("resendIn", { seconds: otp.secondsLeft }) : t("resend")}
        </Button>
      </div>
    </form>
  );
}
