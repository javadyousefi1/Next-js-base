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
  "group/tile flex flex-col items-center gap-2 rounded-xl bg-muted/40 p-4 text-center text-sm font-medium outline-none ring-1 ring-foreground/5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

function TileIcon({ icon: Icon, tone }: { icon: LucideIcon; tone: string }) {
  return (
    <span className={cn("flex size-11 items-center justify-center rounded-full", tone)} aria-hidden>
      <Icon className="size-5" />
    </span>
  );
}

/** Shortcuts: the invite-link create modal (same hook as its page), pending identities, the profile, users. */
export function QuickActionsCard() {
  const t = useTranslations("Dashboard.actions");
  const inviteLinks = useInviteLinkActions();

  return (
    <Card className="lg:col-span-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapIcon className="size-4 text-amber-500" aria-hidden />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4" data-testid="quick-actions">
        <button type="button" className={TILE} onClick={inviteLinks.create}>
          <TileIcon
            icon={Link2Icon}
            tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
          />
          {t("createInviteLink")}
        </button>
        <Link href={PENDING_IDENTITY_HREF} className={TILE}>
          <TileIcon
            icon={ShieldCheckIcon}
            tone="bg-amber-500/15 text-amber-600 dark:text-amber-300"
          />
          {t("reviewIdentity")}
        </Link>
        <Link href={ROUTES.profile} className={TILE}>
          <TileIcon
            icon={UserRoundIcon}
            tone="bg-violet-500/15 text-violet-600 dark:text-violet-300"
          />
          {t("myProfile")}
        </Link>
        <Link href={ROUTES.users} className={TILE}>
          <TileIcon icon={UsersIcon} tone="bg-sky-500/15 text-sky-600 dark:text-sky-300" />
          {t("users")}
        </Link>
      </CardContent>
    </Card>
  );
}
