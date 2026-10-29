"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Spinner } from "@repo/ui/components/spinner";
import { useTranslations } from "next-intl";

import { useRemoveAvatar } from "../hooks/use-remove-avatar";
import { useUploadFile } from "../hooks/use-upload-file";
import { AVATAR_MIME_TYPES, type ProfileInfo } from "../schemas/profile.schema";

/** The avatar with «تغییر تصویر» (JPEG/PNG) and «حذف تصویر» (only when there is one). */
export function AvatarCard({ info }: { info: ProfileInfo }) {
  const t = useTranslations("Profile.avatar");
  const { inputRef, openPicker, onChange, isUploading } = useUploadFile("avatar");
  const { remove, isRemoving } = useRemoveAvatar();
  const busy = isUploading || isRemoving;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-4">
        <Avatar className="size-20" data-testid="profile-avatar">
          {info.avatarUrl && <AvatarImage src={info.avatarUrl} alt="" />}
          <AvatarFallback className="text-xl">{info.fullName.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            hidden
            data-testid="avatar-input"
            accept={AVATAR_MIME_TYPES.join(",")}
            onChange={onChange}
          />
          <Button type="button" variant="outline" disabled={busy} onClick={openPicker}>
            {isUploading && <Spinner data-icon="inline-start" />}
            {t("change")}
          </Button>
          {info.avatarUrl && (
            <Button type="button" variant="outline" disabled={busy} onClick={remove}>
              {t("remove")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
