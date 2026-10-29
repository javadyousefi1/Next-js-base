"use client";

import { Button } from "@repo/ui/components/button";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useInviteLinkActions } from "../hooks/use-invite-link-actions";

/** Page-header button that opens the create modal. */
export function InviteLinkCreateButton() {
  const t = useTranslations("InviteLinks");
  const actions = useInviteLinkActions();

  return (
    <Button onClick={actions.create}>
      <PlusIcon data-icon="inline-start" />
      {t("create")}
    </Button>
  );
}
