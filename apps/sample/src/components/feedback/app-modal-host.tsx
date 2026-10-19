"use client";

import { ModalHost } from "@repo/ui/components/modal-host";
import { useTranslations } from "next-intl";

/** Renders `modal.confirm/alert/prompt/open` (`@repo/ui/lib/modal`) with translated buttons. */
export function AppModalHost() {
  const t = useTranslations("Modal");

  return (
    <ModalHost
      labels={{ confirm: t("confirm"), cancel: t("cancel"), ok: t("ok"), close: t("close") }}
    />
  );
}
