"use client";

import { modal } from "@repo/ui/lib/modal";
import { useTranslations } from "next-intl";

import { InviteLinkForm } from "../components/invite-link-form";

/** Toolbar action of the invite links page: the create form in a modal (it closes itself). */
export function useInviteLinkActions() {
  const t = useTranslations("InviteLinks");

  return {
    create: () => void modal.open(<InviteLinkForm />, { title: t("form.createTitle") }),
  };
}
