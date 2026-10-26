"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";

import { registerMutation } from "../api/auth.queries";
import { registerInputSchema, type RegisterInput } from "../schemas/auth.schema";
import { useAuthMessages } from "./use-auth-messages";

/**
 * Registration, two steps: the details (→ the backend sends an SMS code), then the code
 * (`useOtpVerify`), which signs the new user in. `changeNumber` goes back to the first step.
 */
export function useRegisterForm() {
  // react-hook-form keeps mutable state in refs; opt this hook out of React Compiler memoization.
  "use no memo";

  const messages = useAuthMessages();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerInputSchema),
    defaultValues: { firstName: "", lastName: "", phoneNumber: "" },
  });

  const mutation = registerMutation.useMutation();

  const submit = form.handleSubmit((values) =>
    mutation.mutate(values, { onSuccess: () => setSentTo(values.phoneNumber) }),
  );

  const fieldError = (name: keyof RegisterInput) =>
    messages.fieldError(form.formState.errors[name]?.message);

  return {
    /** The phone the code was sent to; `null` while the details step is shown. */
    sentTo,
    changeNumber: () => setSentTo(null),
    register: form.register,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event),
    errors: {
      firstName: fieldError("firstName"),
      lastName: fieldError("lastName"),
      phoneNumber: fieldError("phoneNumber"),
    },
    formError: messages.formError(mutation.error),
    isSubmitting: mutation.isPending,
  };
}
