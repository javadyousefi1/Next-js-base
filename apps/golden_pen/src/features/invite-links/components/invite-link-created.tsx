"use client";

import { Button } from "@repo/ui/components/button";
import { DialogFooter } from "@repo/ui/components/dialog";
import { useModalClose } from "@repo/ui/hooks/use-modal-close";
import { useTranslations } from "next-intl";

import { CopyLinkButton } from "./copy-link-button";

/** Result view of the create modal: the new link, selectable and copyable. */
export function InviteLinkCreated({ inviteUrl }: { inviteUrl: string }) {
  const t = useTranslations("InviteLinks");
  const close = useModalClose();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{t("form.createdHint")}</p>
      <div className="flex items-center gap-1 rounded-md border bg-muted/50 p-2">
        <span
          dir="ltr"
          data-testid="created-invite-url"
          className="min-w-0 flex-1 text-sm break-all select-all"
        >
          {inviteUrl}
        </span>
        <CopyLinkButton url={inviteUrl} />
      </div>
      <DialogFooter>
        <Button type="button" onClick={() => close()}>
          {t("form.close")}
        </Button>
      </DialogFooter>
    </div>
  );
}
