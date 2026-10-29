"use client";

import { Button } from "@repo/ui/components/button";
import { useDirection } from "@repo/ui/components/direction";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet";
import { CheckCircleIcon, ShieldOffIcon, XCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { useIdentityActions } from "../hooks/use-identity-actions";
import type { useIdentityReview } from "../hooks/use-identity-review";
import { IdentityReviewBody } from "./identity-review-body";

type IdentityReviewSheetProps = {
  review: ReturnType<typeof useIdentityReview>;
  actions: ReturnType<typeof useIdentityActions>;
};

const ICONS = { verify: CheckCircleIcon, reject: XCircleIcon, revoke: ShieldOffIcon };

/** The review side sheet of one row (same side as the filters drawer): the identity, documents and the row's actions. */
export function IdentityReviewSheet({ review, actions }: IdentityReviewSheetProps) {
  const t = useTranslations("IdentityRequests");
  const tDataTable = useTranslations("DataTable");
  const direction = useDirection();
  const { user } = review;
  const available = user ? actions.actionsFor(user.identityStatus) : [];

  return (
    <Sheet open={review.isOpen} onOpenChange={review.setOpen}>
      <SheetContent
        side={direction === "rtl" ? "left" : "right"}
        closeLabel={tDataTable("close")}
        className="data-[side=left]:sm:max-w-md data-[side=right]:sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle>{t("review.title")}</SheetTitle>
          <SheetDescription>{t("review.description")}</SheetDescription>
        </SheetHeader>
        {user && <IdentityReviewBody user={user} />}
        {user && available.length > 0 && (
          <SheetFooter className="flex-row flex-wrap">
            {available.map((action) => {
              const Icon = ICONS[action];
              return (
                <Button
                  key={action}
                  variant={action === "verify" ? "default" : "destructive"}
                  disabled={actions.pendingUserId === user.id}
                  onClick={() => actions[action](user)}
                >
                  <Icon data-icon="inline-start" />
                  {t(`actions.${action}`)}
                </Button>
              );
            })}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
