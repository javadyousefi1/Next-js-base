"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useModalClose } from "@repo/ui/hooks/use-modal-close";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";

import {
  REASON_CHIPS,
  reasonFormSchema,
  type ReasonAction,
  type ReasonFormInput,
} from "../schemas/identity-requests.schema";

type Options = {
  action: ReasonAction;
  /** Runs the action; throws an `Error` with the text to show when it fails. */
  onSubmit: (message: string) => Promise<void>;
};

/** zod messages in the schema are keys of `IdentityRequests.validation`. */
const VALIDATION_KEYS = ["reasonTooShort", "reasonTooLong"] as const;

/**
 * The reason form inside `modal.open` (reject / revoke): react-hook-form + zod, quick-pick chips
 * that fill the textarea. Closes with `true` when the action succeeded.
 */
export function useIdentityReasonForm({ action, onSubmit }: Options) {
  // react-hook-form keeps mutable state in refs; opt this hook out of React Compiler memoization.
  "use no memo";

  const t = useTranslations("IdentityRequests");
  const close = useModalClose();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ReasonFormInput, unknown, { message: string }>({
    resolver: zodResolver(reasonFormSchema),
    defaultValues: { message: "" },
  });

  const submit = form.handleSubmit(async ({ message }) => {
    setFormError(null);
    try {
      await onSubmit(message);
      close(true);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("errors.generic"));
    }
  });

  const message = form.formState.errors.message?.message;
  const errorKey = VALIDATION_KEYS.find((candidate) => candidate === message);
  const chips =
    action === "reject"
      ? REASON_CHIPS.reject.map((key) => t(`reasons.reject.${key}`))
      : REASON_CHIPS.revoke.map((key) => t(`reasons.revoke.${key}`));

  return {
    register: form.register,
    chips,
    fillReason: (text: string) =>
      form.setValue("message", text, { shouldValidate: true, shouldDirty: true }),
    error: errorKey ? t(`validation.${errorKey}`) : undefined,
    formError,
    isSubmitting: form.formState.isSubmitting,
    submitLabel: action === "reject" ? t("reject.submit") : t("revoke.submit"),
    onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event),
    cancel: () => close(),
  };
}
