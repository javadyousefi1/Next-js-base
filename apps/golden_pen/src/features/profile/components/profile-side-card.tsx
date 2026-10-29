"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { FileDropzone } from "@repo/ui/components/file-dropzone";
import { useTranslations } from "next-intl";

import { useProfileSide } from "../hooks/use-profile-side";
import { useRemoveAvatar } from "../hooks/use-remove-avatar";
import { useUploadFile } from "../hooks/use-upload-file";
import type { Profile } from "../schemas/profile.schema";

/** Compact summary: avatar with a drop zone and «حذف تصویر», name, phone, roles and identity status. */
export function ProfileSideCard({ profile }: { profile: Profile }) {
  const t = useTranslations("Profile");
  const { info } = profile;
  const dropzone = useUploadFile("avatar");
  const { remove, isRemoving } = useRemoveAvatar();
  const side = useProfileSide(profile.identity);
  const busy = dropzone.busy || isRemoving;

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 text-center">
        <Avatar className="size-24" data-testid="profile-avatar">
          {info.avatarUrl && <AvatarImage src={info.avatarUrl} alt="" />}
          <AvatarFallback className="text-2xl">{info.fullName.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <FileDropzone
          {...dropzone}
          busy={busy}
          className="min-h-24 gap-1 p-3"
          data-testid="avatar-input"
        />
        {info.avatarUrl && (
          <Button type="button" variant="outline" size="sm" disabled={busy} onClick={remove}>
            {t("avatar.remove")}
          </Button>
        )}
        <div className="flex w-full min-w-0 flex-col gap-1">
          <p className="truncate font-heading text-base font-medium">{info.fullName}</p>
          <p className="text-sm text-muted-foreground" dir="ltr">
            {info.phoneNumber}
          </p>
        </div>
        {/* Fixed height: the roles arrive with the session and must not push the card. */}
        <div className="flex min-h-5 flex-wrap justify-center gap-1">
          {side.roles.map((role) => (
            <Badge key={role} variant="secondary">
              {role}
            </Badge>
          ))}
        </div>
        {side.status && (
          <Badge variant="outline" data-testid="identity-status">
            {side.status}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
