"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { cn } from "@repo/ui/lib/utils";
import {
  ArrowUpLeftIcon,
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

import { IDENTITY_REQUESTS_HREF } from "../hooks/use-admin-pulse";

const TILE =
  "group/tile relative flex flex-col items-start gap-2 rounded-xl border border-border/70 bg-muted/20 p-3 text-start sm:p-4 text-sm font-medium outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-ring/50 hover:bg-muted/60 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

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

/** Shortcuts: the invite-link create modal (same hook as its page), identity requests, the profile, users. */
export function QuickActionsCard() {
  const t = useTranslations("Dashboard.actions");
  const inviteLinks = useInviteLinkActions();

  return (
    <Card className="gap-5 rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ZapIcon className="size-4 text-muted-foreground" aria-hidden />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3" data-testid="quick-actions">
        <button
          type="button"
          className={cn(
            TILE,
            "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
          )}
          onClick={inviteLinks.create}
        >
          <TileIcon icon={Link2Icon} tone="bg-primary-foreground/15 text-primary-foreground" />
          <span>{t("createInviteLink")}</span>
          <span className="text-xs leading-6 font-normal text-primary-foreground/75">
            {t("createInviteLinkHint")}
          </span>
          <ArrowUpLeftIcon
            className="absolute end-4 top-4 size-4 text-primary-foreground/70 transition-transform group-hover/tile:-translate-x-0.5 group-hover/tile:-translate-y-0.5 motion-reduce:transition-none"
            aria-hidden
          />
        </button>
        <Link href={IDENTITY_REQUESTS_HREF} className={TILE}>
          <TileIcon icon={ShieldCheckIcon} tone="bg-muted text-foreground" />
          <span>{t("reviewIdentity")}</span>
          <span className="text-xs leading-6 font-normal text-muted-foreground">
            {t("reviewIdentityHint")}
          </span>
          <ArrowUpLeftIcon
            className="absolute end-4 top-4 size-4 text-muted-foreground transition-transform group-hover/tile:-translate-x-0.5 group-hover/tile:-translate-y-0.5 motion-reduce:transition-none"
            aria-hidden
          />
        </Link>
        <Link href={ROUTES.profile} className={TILE}>
          <TileIcon icon={UserRoundIcon} tone="bg-muted text-foreground" />
          <span>{t("myProfile")}</span>
          <span className="text-xs leading-6 font-normal text-muted-foreground">
            {t("myProfileHint")}
          </span>
          <ArrowUpLeftIcon
            className="absolute end-4 top-4 size-4 text-muted-foreground transition-transform group-hover/tile:-translate-x-0.5 group-hover/tile:-translate-y-0.5 motion-reduce:transition-none"
            aria-hidden
          />
        </Link>
        <Link href={ROUTES.users} className={TILE}>
          <TileIcon icon={UsersIcon} tone="bg-muted text-foreground" />
          <span>{t("users")}</span>
          <span className="text-xs leading-6 font-normal text-muted-foreground">
            {t("usersHint")}
          </span>
          <ArrowUpLeftIcon
            className="absolute end-4 top-4 size-4 text-muted-foreground transition-transform group-hover/tile:-translate-x-0.5 group-hover/tile:-translate-y-0.5 motion-reduce:transition-none"
            aria-hidden
          />
        </Link>
      </CardContent>
    </Card>
  );
}
