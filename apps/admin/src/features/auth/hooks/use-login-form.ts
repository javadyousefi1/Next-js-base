"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { ApiError } from "@repo/http";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useQueryState } from "nuqs";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";

import { CALLBACK_URL_PARAM, sanitizeCallbackUrl } from "@/config/routes";
import { useAppRouter } from "@/hooks/use-app-router";

import { loginMutation, sessionQuery } from "../api/auth.queries";
import { loginInputSchema, PASSWORD_MIN_LENGTH, type LoginInput } from "../schemas/auth.schema";

/** zod messages in auth.schema.ts are i18n keys of `Auth.validation`. */
const VALIDATION_KEYS = ["usernameRequired", "passwordMin"] as const;

/**
 * Login form logic: react-hook-form + the same zod schema the BFF validates with, the login
 * mutation, error → message mapping and the post-login redirect (`?callbackUrl=`).
 */
export function useLoginForm() {
  // react-hook-form keeps mutable state in refs; opt this hook out of React Compiler memoization.
  "use no memo";

  const t = useTranslations("Auth");
  const router = useAppRouter();
  const queryClient = useQueryClient();
  const [callbackUrl] = useQueryState(CALLBACK_URL_PARAM);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { username: "", password: "" },
  });

  const mutation = loginMutation.useMutation({
    onSuccess: ({ user }) => {
      sessionQuery.setData(queryClient, undefined, () => user);
      router.replace(sanitizeCallbackUrl(callbackUrl));
    },
  });

  const fieldError = (name: keyof LoginInput) => {
    const message = form.formState.errors[name]?.message;
    const key = VALIDATION_KEYS.find((candidate) => candidate === message);
    return key ? t(`validation.${key}`, { min: PASSWORD_MIN_LENGTH }) : undefined;
  };
  const submit = form.handleSubmit((values) => mutation.mutate(values));

  const formError = (error: ApiError | null) => {
    if (!error) return null;
    if (error.code === "RATE_LIMITED") {
      return t("errors.rateLimited", { seconds: error.retryAfterSeconds ?? 60 });
    }
    if (error.code === "UNAUTHORIZED" || error.code === "VALIDATION") {
      return t("errors.invalidCredentials");
    }
    return t("errors.generic");
  };

  return {
    register: form.register,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event),
    errors: { username: fieldError("username"), password: fieldError("password") },
    formError: formError(mutation.error),
    isSubmitting: mutation.isPending || mutation.isSuccess,
  };
}
