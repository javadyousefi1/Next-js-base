"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useModalClose } from "@repo/ui/hooks/use-modal-close";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";

import { createInviteLinkMutation } from "../api/invite-links.queries";
import {
  createInviteLinkFormSchema,
  type CreatedInviteLink,
  type CreateInviteLinkFormInput,
  type CreateInviteLinkInput,
} from "../schemas/invite-link.schema";

/** zod messages in invite-link.schema.ts (and `phoneNumberSchema`) are keys of `InviteLinks.validation`. */
const VALIDATION_KEYS = [
  "firstNameRequired",
  "lastNameRequired",
  "phoneInvalid",
  "expiresInvalid",
] as const;

/**
 * The create form inside `modal.open`: react-hook-form + zod. On success the modal stays open
 * and `created` holds the new link for the result view; `close` ends the modal.
 */
export function useInviteLinkForm() {
  // react-hook-form keeps mutable state in refs; opt this hook out of React Compiler memoization.
  "use no memo";

  const t = useTranslations("InviteLinks");
  const close = useModalClose();
  const [created, setCreated] = useState<CreatedInviteLink | null>(null);
  const form = useForm<CreateInviteLinkFormInput, unknown, CreateInviteLinkInput>({
    resolver: zodResolver(createInviteLinkFormSchema),
    defaultValues: { firstName: "", lastName: "", phoneNumber: "", expiresInDays: "" },
  });
  const mutation = createInviteLinkMutation.useMutation({ onSuccess: setCreated });

  const submit = form.handleSubmit((values) => mutation.mutate(values));
  const fieldError = (name: keyof CreateInviteLinkFormInput) => {
    const message = form.formState.errors[name]?.message;
    const key = VALIDATION_KEYS.find((candidate) => candidate === message);
    return key ? t(`validation.${key}`) : undefined;
  };
  const error = mutation.error;

  return {
    created,
    register: form.register,
    errors: {
      firstName: fieldError("firstName"),
      lastName: fieldError("lastName"),
      phoneNumber: fieldError("phoneNumber"),
      expiresInDays: fieldError("expiresInDays"),
    },
    // 400/409: the server's reason (e.g. a valid link already exists for this phone).
    formError: error
      ? (error.status === 400 || error.status === 409) && error.message
        ? error.message
        : t("errors.generic")
      : null,
    isSubmitting: mutation.isPending,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event),
    cancel: () => close(),
  };
}
