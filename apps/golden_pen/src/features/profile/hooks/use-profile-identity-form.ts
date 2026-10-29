"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { useCities } from "@/features/base-info/hooks/use-cities";
import { useProvinces } from "@/features/base-info/hooks/use-provinces";
import { useIdentityStatusLabel } from "@/features/users/hooks/use-identity-status-label";

import { updateIdentityMutation } from "../api/profile.queries";
import {
  updateIdentityFormSchema,
  type ProfileIdentity,
  type UpdateIdentityFormInput,
  type UpdateIdentityInput,
} from "../schemas/profile.schema";
import { serverMessage } from "./server-message";

/** zod messages in profile.schema.ts are keys of `Profile.validation`. */
const VALIDATION_KEYS = ["nationalIdInvalid", "postalCodeInvalid"] as const;

type TextField = Exclude<keyof UpdateIdentityFormInput, "provinceId" | "cityId">;

const idText = (id: number | null | undefined) =>
  id === null || id === undefined ? "" : String(id);

/**
 * The identity / professional form (`identity` is `null` for a user without one): province →
 * city selects (the cities follow the province), saved with `PUT /User/Update` (type 2).
 */
export function useProfileIdentityForm(identity: ProfileIdentity | null) {
  // react-hook-form keeps mutable state in refs; opt this hook out of React Compiler memoization.
  "use no memo";

  const t = useTranslations("Profile");
  const statusLabel = useIdentityStatusLabel();
  const form = useForm<UpdateIdentityFormInput, unknown, UpdateIdentityInput>({
    resolver: zodResolver(updateIdentityFormSchema),
    // The API does not return the office address: it starts empty.
    defaultValues: {
      specialty: identity?.specialty ?? "",
      bio: identity?.bio ?? "",
      licenseNumber: identity?.licenseNumber ?? "",
      barAssociation: identity?.barAssociation ?? "",
      provinceId: idText(identity?.provinceId),
      cityId: idText(identity?.cityId),
      officeText: "",
      officePostalCode: "",
      officePhone: "",
      nationalId: identity?.nationalId ?? "",
      companyName: identity?.companyName ?? "",
      companyNationalId: identity?.companyNationalId ?? "",
      companyRegistrationNumber: identity?.companyRegistrationNumber ?? "",
      companyRepresentativeName: identity?.companyRepresentativeName ?? "",
    },
  });
  const mutation = updateIdentityMutation.useMutation({
    onSuccess: () => {
      form.reset(form.getValues());
      toast.success(t("identity.saved"));
    },
  });

  const [provinceId, cityId] = useWatch({
    control: form.control,
    name: ["provinceId", "cityId"],
  });
  const { provinces } = useProvinces();
  const { cities, isLoading: isLoadingCities } = useCities(
    provinceId === "" ? null : Number(provinceId),
  );

  const submit = form.handleSubmit((values) => mutation.mutate(values));
  const fieldError = (name: TextField) => {
    const message = form.formState.errors[name]?.message;
    const key = VALIDATION_KEYS.find((candidate) => candidate === message);
    return key ? t(`validation.${key}`) : undefined;
  };

  return {
    status: identity
      ? { label: statusLabel(identity.statusType), message: identity.message }
      : null,
    register: form.register,
    errors: {
      nationalId: fieldError("nationalId"),
      officePostalCode: fieldError("officePostalCode"),
    },
    provinceId,
    cityId,
    provinceItems: provinces.map(({ id, name }) => ({ value: String(id), label: name })),
    cityItems: cities.map(({ id, name }) => ({ value: String(id), label: name })),
    isLoadingCities,
    selectProvince: (value: string | null) => {
      form.setValue("provinceId", value ?? "", { shouldDirty: true });
      // The cities belong to the province: the old city no longer applies.
      form.setValue("cityId", "", { shouldDirty: true });
    },
    selectCity: (value: string | null) =>
      form.setValue("cityId", value ?? "", { shouldDirty: true }),
    formError: serverMessage(mutation.error, t("errors.generic")),
    canSubmit: form.formState.isDirty && !mutation.isPending,
    isSubmitting: mutation.isPending,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event),
  };
}
