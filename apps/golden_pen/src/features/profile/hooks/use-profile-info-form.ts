"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { updateInfoMutation } from "../api/profile.queries";
import {
  updateInfoFormSchema,
  type ProfileInfo,
  type UpdateInfoFormInput,
  type UpdateInfoInput,
} from "../schemas/profile.schema";
import { serverMessage } from "./server-message";

/** zod messages in profile.schema.ts (and `phoneNumberSchema`) are keys of `Profile.validation`. */
const VALIDATION_KEYS = [
  "firstNameRequired",
  "lastNameRequired",
  "phoneInvalid",
  "emailInvalid",
] as const;

/** The basic-info form: prefilled, saved with `PUT /User/Update` (type 1), disabled until dirty. */
export function useProfileInfoForm(info: ProfileInfo) {
  // react-hook-form keeps mutable state in refs; opt this hook out of React Compiler memoization.
  "use no memo";

  const t = useTranslations("Profile");
  const form = useForm<UpdateInfoFormInput, unknown, UpdateInfoInput>({
    resolver: zodResolver(updateInfoFormSchema),
    defaultValues: {
      firstName: info.firstName,
      lastName: info.lastName,
      phoneNumber: info.phoneNumber,
      username: info.username ?? "",
      email: info.email ?? "",
    },
  });
  const mutation = updateInfoMutation.useMutation({
    onSuccess: () => {
      // The saved values are the new baseline: the button is disabled again.
      form.reset(form.getValues());
      toast.success(t("info.saved"));
    },
  });

  const submit = form.handleSubmit((values) => mutation.mutate(values));
  const fieldError = (name: keyof UpdateInfoFormInput) => {
    const message = form.formState.errors[name]?.message;
    const key = VALIDATION_KEYS.find((candidate) => candidate === message);
    return key ? t(`validation.${key}`) : undefined;
  };

  return {
    register: form.register,
    errors: {
      firstName: fieldError("firstName"),
      lastName: fieldError("lastName"),
      phoneNumber: fieldError("phoneNumber"),
      email: fieldError("email"),
    },
    formError: serverMessage(mutation.error, t("errors.generic")),
    canSubmit: form.formState.isDirty && !mutation.isPending,
    isSubmitting: mutation.isPending,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event),
  };
}
