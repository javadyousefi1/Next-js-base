"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";

import { passwordLoginMutation } from "../api/auth.queries";
import { passwordLoginInputSchema, type PasswordLoginInput } from "../schemas/auth.schema";
import { useAuthMessages } from "./use-auth-messages";
import { useSignInSuccess } from "./use-sign-in-success";

/**
 * Password login form logic: react-hook-form + the same zod schema the BFF validates with, the
 * login mutation, error → message mapping and the post-login redirect (`?callbackUrl=`).
 */
export function usePasswordLoginForm() {
  // react-hook-form keeps mutable state in refs; opt this hook out of React Compiler memoization.
  "use no memo";

  const messages = useAuthMessages();
  const onSignedIn = useSignInSuccess();

  const form = useForm<PasswordLoginInput>({
    resolver: zodResolver(passwordLoginInputSchema),
    defaultValues: { phoneNumber: "", password: "" },
  });

  const mutation = passwordLoginMutation.useMutation({ onSuccess: onSignedIn });

  const fieldError = (name: keyof PasswordLoginInput) =>
    messages.fieldError(form.formState.errors[name]?.message);
  const submit = form.handleSubmit((values) => mutation.mutate(values));

  return {
    register: form.register,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event),
    errors: { phoneNumber: fieldError("phoneNumber"), password: fieldError("password") },
    formError: messages.formError(mutation.error),
    isSubmitting: mutation.isPending || mutation.isSuccess,
  };
}
