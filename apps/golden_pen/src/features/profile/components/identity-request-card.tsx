"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent } from "@repo/ui/components/card";
import { Spinner } from "@repo/ui/components/spinner";
import { cn } from "@repo/ui/lib/utils";
import { BadgeCheckIcon, ClockIcon, ShieldCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { useIdentityRequest } from "../hooks/use-identity-request";
import type { ProfileIdentity } from "../schemas/profile.schema";

const ICONS = { idle: ShieldCheckIcon, requested: ClockIcon, verified: BadgeCheckIcon };
const TONES = {
  idle: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
  requested: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
  verified: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
};

/**
 * Top of the identity tab: the verification status with «درخواست احراز هویت» (None / Pending /
 * Rejected / Revoked), a disabled «در حال بررسی» (Requested) or a success state (Verified).
 * Fixed height: the profile skeleton reserves it.
 */
export function IdentityRequestCard({ identity }: { identity: ProfileIdentity | null }) {
  const t = useTranslations("Profile.identityRequest");
  const request = useIdentityRequest(identity);
  const Icon = ICONS[request.state];

  return (
    <Card className="min-h-24" data-testid="identity-request">
      <CardContent className="flex flex-wrap items-center gap-4">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            TONES[request.state],
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="font-heading text-sm font-medium">{t("title")}</p>
          <p className="text-sm text-muted-foreground">{request.description}</p>
          {request.reason && <p className="text-sm text-muted-foreground">{request.reason}</p>}
          {request.error && (
            <p role="alert" className="text-sm text-destructive">
              {request.error}
            </p>
          )}
        </div>
        {request.state !== "verified" && (
          <Button
            onClick={request.request}
            disabled={request.state === "requested" || request.isSubmitting}
          >
            {request.isSubmitting && <Spinner data-icon="inline-start" />}
            {request.state === "requested" ? t("requested") : t("submit")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
