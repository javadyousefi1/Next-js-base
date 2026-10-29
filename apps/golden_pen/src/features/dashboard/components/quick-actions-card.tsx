"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import {
  Link2Icon,
  ShieldCheckIcon,
  UserRoundIcon,
  UsersIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { useInviteLinkActions } from "@/features/invite-links/hooks/use-invite-link-actions";
import { Link } from "@/i18n/navigation";

import { PENDING_IDENTITY_HREF } from "../hooks/use-admin-pulse";

const TILE =
  "group/tile flex flex-col items-center gap-3 rounded-xl border border-border/70 bg-card p-4 text-center text-sm font-medium outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-ring/50 hover:bg-muted/60 hover:shadow-sm sm:flex-row sm:text-start focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function TileIcon({ icon: Icon, tone }: { icon: LucideIcon; tone: string }) {
  return (
    <span
      className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", tone)}
      aria-hidden
    >
      <Icon className="size-5" />
    </span>
  );
}

/** Shortcuts: the invite-link create modal (same hook as its page), pending identities, the profile, users. */
export function QuickActionsCard() {
  const t = useTranslations("Dashboard.actions");
  const inviteLinks = useInviteLinkActions();

  return (
    <Card className="gap-5 rounded-2xl shadow-sm lg:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapIcon className="size-4 text-muted-foreground" aria-hidden />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="quick-actions">
        <button type="button" className={TILE} onClick={inviteLinks.create}>
          <TileIcon icon={Link2Icon} tone="bg-muted text-foreground" />
          {t("createInviteLink")}
        </button>
        <Link href={PENDING_IDENTITY_HREF} className={TILE}>
          <TileIcon icon={ShieldCheckIcon} tone="bg-muted text-foreground" />
          {t("reviewIdentity")}
        </Link>
        <Link href={ROUTES.profile} className={TILE}>
          <TileIcon icon={UserRoundIcon} tone="bg-muted text-foreground" />
          {t("myProfile")}
        </Link>
        <Link href={ROUTES.users} className={TILE}>
          <TileIcon icon={UsersIcon} tone="bg-muted text-foreground" />
          {t("users")}
        </Link>
      </CardContent>
    </Card>
  );
}
