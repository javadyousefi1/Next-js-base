"use client";

import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Field, FieldError, FieldLabel } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { Textarea } from "@repo/ui/components/textarea";
import { useTranslations } from "next-intl";

import { useProfileIdentityForm } from "../hooks/use-profile-identity-form";
import type { ProfileIdentity } from "../schemas/profile.schema";
import { LocationSelect } from "./location-select";
import { ProfileFormSection as Section } from "./profile-form-section";

/** «اطلاعات هویتی/حرفه‌ای»: the identity status, professional data, location, office and company. */
export function ProfileIdentityForm({ identity }: { identity: ProfileIdentity | null }) {
  const t = useTranslations("Profile");
  const form = useProfileIdentityForm(identity);

  return (
    <Card>
      <form onSubmit={form.onSubmit} noValidate className="flex flex-col gap-6">
        <CardHeader>
          <CardTitle>{t("identity.title")}</CardTitle>
          <CardDescription>{t("identity.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {form.status?.message && (
            <Alert>
              <AlertTitle>{t("identity.message")}</AlertTitle>
              <AlertDescription>{form.status.message}</AlertDescription>
            </Alert>
          )}
          <Section title={t("sections.professional")}>
            <Field>
              <FieldLabel htmlFor="profile-specialty">{t("fields.specialty")}</FieldLabel>
              <Input id="profile-specialty" {...form.register("specialty")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-license-number">{t("fields.licenseNumber")}</FieldLabel>
              <Input id="profile-license-number" dir="ltr" {...form.register("licenseNumber")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-bar-association">
                {t("fields.barAssociation")}
              </FieldLabel>
              <Input id="profile-bar-association" {...form.register("barAssociation")} />
            </Field>
            <Field data-invalid={form.errors.nationalId ? true : undefined}>
              <FieldLabel htmlFor="profile-national-id">{t("fields.nationalId")}</FieldLabel>
              <Input
                id="profile-national-id"
                dir="ltr"
                inputMode="numeric"
                aria-invalid={form.errors.nationalId ? true : undefined}
                {...form.register("nationalId")}
              />
              {form.errors.nationalId && <FieldError>{form.errors.nationalId}</FieldError>}
            </Field>
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="profile-bio">{t("fields.bio")}</FieldLabel>
              <Textarea id="profile-bio" rows={4} {...form.register("bio")} />
            </Field>
          </Section>
          <Section title={t("sections.workplace")}>
            <LocationSelect
              label={t("fields.province")}
              placeholder={t("fields.provincePlaceholder")}
              items={form.provinceItems}
              value={form.provinceId}
              onChange={form.selectProvince}
            />
            <LocationSelect
              label={t("fields.city")}
              placeholder={t("fields.cityPlaceholder")}
              items={form.cityItems}
              value={form.cityId}
              onChange={form.selectCity}
              disabled={form.provinceId === "" || form.isLoadingCities}
            />
            <Field className="sm:col-span-2">
              <FieldLabel htmlFor="profile-office-text">{t("fields.officeText")}</FieldLabel>
              <Input id="profile-office-text" {...form.register("officeText")} />
            </Field>
            <Field data-invalid={form.errors.officePostalCode ? true : undefined}>
              <FieldLabel htmlFor="profile-office-postal">
                {t("fields.officePostalCode")}
              </FieldLabel>
              <Input
                id="profile-office-postal"
                dir="ltr"
                inputMode="numeric"
                aria-invalid={form.errors.officePostalCode ? true : undefined}
                {...form.register("officePostalCode")}
              />
              {form.errors.officePostalCode && (
                <FieldError>{form.errors.officePostalCode}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-office-phone">{t("fields.officePhone")}</FieldLabel>
              <Input
                id="profile-office-phone"
                dir="ltr"
                inputMode="tel"
                {...form.register("officePhone")}
              />
            </Field>
          </Section>
          <Section title={t("sections.company")}>
            <Field>
              <FieldLabel htmlFor="profile-company-name">{t("fields.companyName")}</FieldLabel>
              <Input id="profile-company-name" {...form.register("companyName")} />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-company-national-id">
                {t("fields.companyNationalId")}
              </FieldLabel>
              <Input
                id="profile-company-national-id"
                dir="ltr"
                {...form.register("companyNationalId")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-company-registration">
                {t("fields.companyRegistrationNumber")}
              </FieldLabel>
              <Input
                id="profile-company-registration"
                dir="ltr"
                {...form.register("companyRegistrationNumber")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profile-company-representative">
                {t("fields.companyRepresentativeName")}
              </FieldLabel>
              <Input
                id="profile-company-representative"
                {...form.register("companyRepresentativeName")}
              />
            </Field>
          </Section>
          {form.formError && (
            <p role="alert" className="text-sm text-destructive">
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
