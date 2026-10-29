"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { IdCardIcon, PlusIcon, UserPenIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { useInviteLinkActions } from "@/features/invite-links/hooks/use-invite-link-actions";
import { Link } from "@/i18n/navigation";

import { PENDING_IDENTITY_HREF } from "../hooks/use-admin-pulse";

/** Shortcuts: the invite-link create modal (same hook as its page), pending identities, the profile. */
export function QuickActionsCard() {
  const t = useTranslations("Dashboard.actions");
  const inviteLinks = useInviteLinkActions();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button onClick={inviteLinks.create}>
          <PlusIcon data-icon="inline-start" />
          {t("createInviteLink")}
        </Button>
        <Button variant="outline" render={<Link href={PENDING_IDENTITY_HREF} />}>
          <IdCardIcon data-icon="inline-start" />
          {t("reviewIdentity")}
        </Button>
        <Button variant="outline" render={<Link href={ROUTES.profile} />}>
          <UserPenIcon data-icon="inline-start" />
          {t("editProfile")}
        </Button>
      </CardContent>
    </Card>
  );
}
