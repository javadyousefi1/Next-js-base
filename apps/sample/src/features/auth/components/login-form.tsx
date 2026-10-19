"use client";

import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useTranslations } from "next-intl";

import { useLoginForm } from "../hooks/use-login-form";

export function LoginForm() {
  const t = useTranslations("Auth");
  const login = useLoginForm();

  return (
    // method="post": a submit before React hydrates the form (dev, slow JS) sends the password in
    // the body, never in the URL.
    <form method="post" noValidate onSubmit={login.onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={Boolean(login.errors.username)}>
          <FieldLabel htmlFor="username">{t("username")}</FieldLabel>
          <Input
            id="username"
            autoComplete="username"
            aria-invalid={Boolean(login.errors.username)}
            {...login.register("username")}
          />
          <FieldError>{login.errors.username}</FieldError>
        </Field>
        <Field data-invalid={Boolean(login.errors.password)}>
          <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(login.errors.password)}
            {...login.register("password")}
          />
          <FieldError>{login.errors.password}</FieldError>
        </Field>
      </FieldGroup>

      {login.formError ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{login.formError}</AlertDescription>
        </Alert>
      ) : null}

      <Button type="submit" size="lg" disabled={login.isSubmitting}>
        {login.isSubmitting ? <Spinner data-icon="inline-start" /> : null}
        {login.isSubmitting ? t("submitting") : t("submit")}
      </Button>

      <p className="text-center text-xs text-muted-foreground">{t("demoHint")}</p>
    </form>
  );
}
