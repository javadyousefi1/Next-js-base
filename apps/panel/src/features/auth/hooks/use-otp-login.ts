"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";

import { otpSendMutation } from "../api/auth.queries";
import { otpSendInputSchema, type OtpSendInput } from "../schemas/auth.schema";
import { useAuthMessages } from "./use-auth-messages";

/**
 * Login with an SMS code, two steps: the phone number (→ the backend sends the code), then the
 * code (`useOtpVerify`). `changeNumber` goes back to the first step.
 */
export function useOtpLogin() {
  // react-hook-form keeps mutable state in refs; opt this hook out of React Compiler memoization.
  "use no memo";

  const messages = useAuthMessages();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<OtpSendInput>({
    resolver: zodResolver(otpSendInputSchema),
    defaultValues: { phoneNumber: "" },
  });

  const mutation = otpSendMutation.useMutation();

  const submit = form.handleSubmit((values) =>
    mutation.mutate(values, { onSuccess: () => setSentTo(values.phoneNumber) }),
  );

  return {
    /** The phone the code was sent to; `null` while the phone step is shown. */
    sentTo,
    changeNumber: () => setSentTo(null),
    register: form.register,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event),
    phoneError: messages.fieldError(form.formState.errors.phoneNumber?.message),
    formError: messages.formError(mutation.error),
    isSubmitting: mutation.isPending,
  };
}
