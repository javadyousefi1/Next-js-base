"use client";

import { modal } from "@repo/ui/lib/modal";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useUploadMutation } from "../profile.api";

/** «حذف تصویر»: asks first, then deletes the avatar (an avatar upload without a file). */
export function useRemoveAvatar() {
  const t = useTranslations("Profile.avatar");
  const mutation = useUploadMutation();

  const confirmRemove = async () => {
    const answer = await modal.confirm(t("removeText"), {
      variant: "destructive",
      title: t("removeTitle"),
      actionButton: { type: "destructive", label: t("remove") },
      onAction: async (action) => {
        if (action === "yes") await mutation.mutateAsync({ target: "avatar", file: null });
      },
    });
    if (answer === "yes") toast.success(t("removed"));
  };

  return { remove: () => void confirmRemove(), isRemoving: mutation.isPending };
}
