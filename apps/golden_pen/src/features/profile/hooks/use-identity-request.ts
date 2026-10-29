"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { identityErrorKind } from "@/features/identity-requests/api/identity-requests.backend";
import { identityActionMutation } from "@/features/identity-requests/api/identity-requests.queries";
import { useIdentityErrorMessage } from "@/features/identity-requests/hooks/use-identity-error-message";

import type { ProfileIdentity } from "../schemas/profile.schema";

/** Identity statuses: 1 Requested, 3 Verified (see `IDENTITY_STATUSES` of the users feature); the rest can (re)request. */
const STATUS_REQUESTED = 1;
const STATUS_VERIFIED = 3;
const STATUS_REJECTED = 4;
const STATUS_REVOKED = 5;

type RequestState = "idle" | "requested" | "verified";

/** The profile's «درخواست احراز هویت» card: what to show for the status, and the request action. */
export function useIdentityRequest(identity: ProfileIdentity | null) {
  const t = useTranslations("Profile.identityRequest");
  const errorMessage = useIdentityErrorMessage();
  const [error, setError] = useState<string | null>(null);
  const mutation = identityActionMutation.useMutation({
    onSuccess: () => toast.success(t("done")),
    onError: (failure) =>
      setError(
        identityErrorKind(failure) === "profileNotComplete"
          ? t("notComplete")
          : errorMessage(failure),
      ),
  });

  const status = identity?.statusType ?? 0;
  const state: RequestState =
    status === STATUS_REQUESTED ? "requested" : status === STATUS_VERIFIED ? "verified" : "idle";
  const hasReason = status === STATUS_REJECTED || status === STATUS_REVOKED;

  return {
    state,
    description:
      state === "requested"
        ? t("requested")
        : state === "verified"
          ? t("verified")
          : status === STATUS_REJECTED
            ? t("rejected")
            : status === STATUS_REVOKED
              ? t("revoked")
              : t("none"),
    reason: hasReason && identity?.message ? t("reason", { message: identity.message }) : null,
    error,
    isSubmitting: mutation.isPending,
    request: () => {
      setError(null);
      mutation.mutate({ action: "request" });
    },
  };
}
