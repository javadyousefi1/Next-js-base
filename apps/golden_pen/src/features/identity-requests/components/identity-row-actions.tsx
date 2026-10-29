"use client";

import { Button } from "@repo/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Spinner } from "@repo/ui/components/spinner";
import {
  CheckCircleIcon,
  EyeIcon,
  MoreHorizontalIcon,
  ShieldOffIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import type { User } from "@/features/users/schemas/user.schema";

import type { useIdentityActions } from "../hooks/use-identity-actions";
import type { RowAction } from "../row-actions";

type Actions = ReturnType<typeof useIdentityActions>;

const ICONS: Record<RowAction, LucideIcon> = {
  verify: CheckCircleIcon,
  reject: XCircleIcon,
  revoke: ShieldOffIcon,
};

type IdentityRowActionsProps = {
  user: User;
  actions: Actions;
  onReview: (user: User) => void;
};

/**
 * The «عملیات» cell: the actions of the row's status (super-admin only) and «بررسی» for
 * everyone. From `md` up they are buttons; below, one ⋯ menu. While this row's action runs its
 * buttons show a spinner and are disabled.
 */
export function IdentityRowActions({ user, actions, onReview }: IdentityRowActionsProps) {
  const t = useTranslations("IdentityRequests");
  const available = actions.actionsFor(user.identityStatus);
  const isPending = actions.pendingUserId === user.id;

  return (
    <div className="flex items-center justify-end gap-1.5" data-testid="row-actions">
      <div className="hidden items-center gap-1.5 md:flex">
        {available.map((action) => {
          const Icon = ICONS[action];
          return (
            <Button
              key={action}
              size="sm"
              variant={action === "verify" ? "default" : "destructive"}
              disabled={isPending}
              onClick={() => actions[action](user)}
            >
              {isPending ? <Spinner data-icon="inline-start" /> : <Icon data-icon="inline-start" />}
              {t(`actions.${action}`)}
            </Button>
          );
        })}
        <Button
          size="icon-sm"
          variant="outline"
          aria-label={t("actions.review")}
          onClick={() => onReview(user)}
        >
          <EyeIcon />
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              variant="outline"
              className="md:hidden"
              disabled={isPending}
              aria-label={t("actions.menu")}
            />
          }
        >
          {isPending ? <Spinner /> : <MoreHorizontalIcon />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {available.map((action) => {
            const Icon = ICONS[action];
            return (
              <DropdownMenuItem
                key={action}
                variant={action === "verify" ? "default" : "destructive"}
                onClick={() => actions[action](user)}
              >
                <Icon />
                {t(`actions.${action}`)}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuItem onClick={() => onReview(user)}>
            <EyeIcon />
            {t("actions.review")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
