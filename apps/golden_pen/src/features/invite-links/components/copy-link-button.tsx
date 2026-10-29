"use client";

import { Button } from "@repo/ui/components/button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useCopyLink } from "../hooks/use-copy-link";

/** Icon button that copies `url` to the clipboard. */
export function CopyLinkButton({ url }: { url: string }) {
  const t = useTranslations("InviteLinks");
  const link = useCopyLink(url);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={link.copied ? t("copied") : t("copy")}
      onClick={link.copy}
    >
      {link.copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}
