"use client";

import { toApiError } from "@repo/http";
import { modal } from "@repo/ui/lib/modal";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type { User } from "@/features/users/schemas/user.schema";

import { identityActionMutation } from "../api/identity-requests.queries";
import { IdentityReasonForm } from "../components/identity-reason-form";
import { rowActionsFor } from "../row-actions";
import type { IdentityActionInput, ReasonAction } from "../schemas/identity-requests.schema";
import { useCanReview } from "./use-can-review";
import { useIdentityErrorMessage } from "./use-identity-error-message";

/**
 * The review actions of the identity-requests page (one instance, shared by the rows and the
 * review sheet): verify asks first, reject / revoke ask for a reason in a modal form. Errors
 * are shown in the modal; success toasts. `pendingUserId` is the row whose action is running.
 */
export function useIdentityActions() {
  const t = useTranslations("IdentityRequests");
  const canAct = useCanReview();
  const errorMessage = useIdentityErrorMessage();
  const mutation = identityActionMutation.useMutation();

  /** Runs the mutation; a failure becomes an `Error` with the Persian text the modal shows. */
  const run = async (input: IdentityActionInput) => {
    try {
      await mutation.mutateAsync(input);
    } catch (error) {
      throw new Error(errorMessage(toApiError(error)), { cause: error });
    }
  };

  const verify = async (user: User) => {
    const answer = await modal.confirm(t("verify.text", { name: user.fullName }), {
      variant: "success",
      title: t("verify.title"),
      actionButton: { label: t("verify.confirm") },
      onAction: async (action) => {
        if (action === "yes") await run({ action: "verify", userId: user.id });
      },
    });
    if (answer === "yes") toast.success(t("verify.done", { name: user.fullName }));
  };

  const askReason = async (action: ReasonAction, user: User) => {
    const done = await modal.open<true>(
      <IdentityReasonForm
        action={action}
        onSubmit={(message) => run({ action, userId: user.id, message })}
      />,
      { title: t(`${action}.title`), description: user.fullName },
    );
    if (done) toast.success(t(`${action}.done`, { name: user.fullName }));
  };

  return {
    verify: (user: User) => void verify(user),
    reject: (user: User) => void askReason("reject", user),
    revoke: (user: User) => void askReason("revoke", user),
    /** The actions an identity status offers (none for a non-super-admin). */
    actionsFor: (identityStatus: number | null) => rowActionsFor(identityStatus, canAct),
    pendingUserId:
      mutation.isPending && mutation.variables && "userId" in mutation.variables
        ? mutation.variables.userId
        : null,
  };
}
