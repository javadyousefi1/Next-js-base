"use client";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useTranslations } from "next-intl";

import { useProfileInfoForm } from "../hooks/use-profile-info-form";
import type { ProfileInfo } from "../schemas/profile.schema";

/** «اطلاعات پایه»: name, phone, username, email. */
export function ProfileInfoForm({ info }: { info: ProfileInfo }) {
  const t = useTranslations("Profile");
  const form = useProfileInfoForm(info);

  return (
    <Card>
      <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>{t("info.title")}</CardTitle>
          <CardDescription>{t("info.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={form.errors.firstName ? true : undefined}>
              <FieldLabel htmlFor="profile-first-name">{t("fields.firstName")}</FieldLabel>
              <Input
                id="profile-first-name"
                aria-invalid={form.errors.firstName ? true : undefined}
                {...form.register("firstName")}
              />
              {form.errors.firstName && <FieldError>{form.errors.firstName}</FieldError>}
            </Field>
            <Field data-invalid={form.errors.lastName ? true : undefined}>
              <FieldLabel htmlFor="profile-last-name">{t("fields.lastName")}</FieldLabel>
              <Input
                id="profile-last-name"
                aria-invalid={form.errors.lastName ? true : undefined}
                {...form.register("lastName")}
              />
              {form.errors.lastName && <FieldError>{form.errors.lastName}</FieldError>}
            </Field>
            <Field data-invalid={form.errors.phoneNumber ? true : undefined}>
              <FieldLabel htmlFor="profile-phone">{t("fields.phoneNumber")}</FieldLabel>
              <Input
                id="profile-phone"
                dir="ltr"
                inputMode="tel"
                placeholder="09123456789"
                aria-invalid={form.errors.phoneNumber ? true : undefined}
                {...form.register("phoneNumber")}
              />
              {form.errors.phoneNumber && <FieldError>{form.errors.phoneNumber}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-username">{t("fields.username")}</FieldLabel>
              <Input id="profile-username" dir="ltr" {...form.register("username")} />
            </Field>
            <Field data-invalid={form.errors.email ? true : undefined}>
              <FieldLabel htmlFor="profile-email">{t("fields.email")}</FieldLabel>
              <Input
                id="profile-email"
                dir="ltr"
                inputMode="email"
                aria-invalid={form.errors.email ? true : undefined}
                {...form.register("email")}
              />
              {form.errors.email && <FieldError>{form.errors.email}</FieldError>}
            </Field>
          </FieldGroup>
          {form.formError && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {form.formError}
            </p>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!form.canSubmit}>
            {form.isSubmitting && <Spinner data-icon="inline-start" />}
            {t("save")}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
