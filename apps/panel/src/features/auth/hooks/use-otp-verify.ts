"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useInterval } from "@repo/hooks/use-interval";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { OTP_RESEND_SECONDS } from "@/config/auth";

import { otpResendMutation, otpVerifyMutation } from "../api/auth.queries";
import { otpVerifyInputSchema } from "../schemas/auth.schema";
import { useAuthMessages } from "./use-auth-messages";
import { useSignInSuccess } from "./use-sign-in-success";

const codeSchema = otpVerifyInputSchema.pick({ code: true });
type CodeInput = z.infer<typeof codeSchema>;

/**
 * "Enter the SMS code" step, shared by OTP login and registration: the code form, the verify
 * mutation (signs in), and "resend" with a cooldown (`OTP_RESEND_SECONDS`).
 */
export function useOtpVerify(phoneNumber: string) {
  // react-hook-form keeps mutable state in refs; opt this hook out of React Compiler memoization.
  "use no memo";

  const messages = useAuthMessages();
  const onSignedIn = useSignInSuccess();
  const [secondsLeft, setSecondsLeft] = useState(OTP_RESEND_SECONDS);

  const form = useForm<CodeInput>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const verify = otpVerifyMutation.useMutation({ onSuccess: onSignedIn });
  const resend = otpResendMutation.useMutation({
    onSuccess: () => setSecondsLeft(OTP_RESEND_SECONDS),
  });

  // The code was just sent: count down once per second until "Resend" is available.
  useInterval(() => setSecondsLeft((seconds) => seconds - 1), secondsLeft > 0 ? 1000 : null);

  const submit = form.handleSubmit(({ code }) => verify.mutate({ phoneNumber, code }));

  return {
    register: form.register,
    onSubmit: (event: FormEvent<HTMLFormElement>) => void submit(event),
    codeError: messages.fieldError(form.formState.errors.code?.message),
    formError: messages.formError(verify.error ?? resend.error, "invalidCode"),
    isSubmitting: verify.isPending || verify.isSuccess,
    secondsLeft,
    canResend: secondsLeft <= 0 && !resend.isPending,
    resendCode: () => resend.mutate({ phoneNumber }),
  };
}
