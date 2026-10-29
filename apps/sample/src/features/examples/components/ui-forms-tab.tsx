"use client";

import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@repo/ui/components/input-group";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { Textarea } from "@repo/ui/components/textarea";
import { GlobeIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useUiExample } from "../hooks/use-ui-example";
import { UiDropzoneExample } from "./ui-dropzone-example";

export function UiFormsTab() {
  const t = useTranslations("Examples.ui.form");
  const tUi = useTranslations("Examples.ui");
  const ui = useUiExample();

  return (
    <>
      <FieldGroup className="max-w-md">
        <Field>
          <FieldLabel htmlFor="ui-email">{t("email")}</FieldLabel>
          <Input id="ui-email" type="email" placeholder="name@example.com" />
          <FieldDescription>{t("emailHint")}</FieldDescription>
        </Field>
        <Field data-invalid>
          <FieldLabel htmlFor="ui-website">{t("website")}</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <GlobeIcon />
            </InputGroupAddon>
            <InputGroupInput id="ui-website" dir="ltr" defaultValue="example" aria-invalid />
          </InputGroup>
          <FieldError>{t("invalid")}</FieldError>
        </Field>
        <Field>
          <FieldLabel htmlFor="ui-bio">{t("bio")}</FieldLabel>
          <Textarea id="ui-bio" />
        </Field>
        <Field>
          <FieldLabel htmlFor="ui-plan">{t("plan")}</FieldLabel>
          <Select items={ui.plans} value={ui.plan.value} onValueChange={ui.plan.onValueChange}>
            <SelectTrigger id="ui-plan" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ui.plans.map((plan) => (
                <SelectItem key={plan.value} value={plan.value}>
                  {tUi(`plans.${plan.value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="ui-terms"
            checked={ui.terms.checked}
            onCheckedChange={ui.terms.onCheckedChange}
          />
          <FieldLabel htmlFor="ui-terms">{t("terms")}</FieldLabel>
        </Field>
        <div className="flex items-center gap-3">
          <Switch
            id="ui-notifications"
            checked={ui.notifications.checked}
            onCheckedChange={ui.notifications.onCheckedChange}
          />
          <Label htmlFor="ui-notifications">
            {t("notifications")}:{" "}
            {ui.notifications.checked ? t("notificationsOn") : t("notificationsOff")}
          </Label>
        </div>
      </FieldGroup>
      <UiDropzoneExample />
    </>
  );
}
