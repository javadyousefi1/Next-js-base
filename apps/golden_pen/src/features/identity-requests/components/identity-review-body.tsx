"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";
import { useTranslations } from "next-intl";

import { QueryError } from "@/components/feedback/query-error";
import { isKnownRole, type User } from "@/features/users/schemas/user.schema";
import { formatJalaliDate } from "@/lib/format-date";

import { useIdentityReviewModel } from "../hooks/use-identity-review-model";
import { IdentityStatusBadge } from "./identity-status-badge";

/** Header (the row's data), then the identity from the detail query with a skeleton of final size while it loads. */
export function IdentityReviewBody({ user }: { user: User }) {
  const t = useTranslations("IdentityRequests.review");
  const tUsers = useTranslations("Users");
  const model = useIdentityReviewModel(user);

  return (
    <div className="flex flex-col gap-5 overflow-y-auto px-4" data-testid="identity-review">
      <div className="flex items-center gap-3">
        <Avatar className="size-14">
          {model.avatarUrl && <AvatarImage src={model.avatarUrl} alt="" />}
          <AvatarFallback className="text-lg">{user.fullName.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate font-heading text-base font-medium">{user.fullName}</p>
          <p className="text-sm text-muted-foreground" dir="ltr">
            {user.phoneNumber}
          </p>
        </div>
      </div>
      <div className="flex min-h-5 flex-wrap gap-1">
        {user.roles.map((role) => (
          <Badge key={role} variant="secondary">
            {isKnownRole(role) ? tUsers(`roles.${role}`) : role}
          </Badge>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3 text-sm">
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">{t("status")}</dt>
          <dd>
            <IdentityStatusBadge status={model.status} />
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">{t("requestedAt")}</dt>
          <dd>{formatJalaliDate(user.identityRequestedAt)}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">{t("reviewedAt")}</dt>
          <dd>{formatJalaliDate(user.identityVerifiedAt)}</dd>
        </div>
        <div className="col-span-2 flex flex-col gap-1">
          <dt className="text-xs text-muted-foreground">{t("message")}</dt>
          <dd>{model.message ?? "—"}</dd>
        </div>
      </dl>

      {model.isLoading ? (
        <div className="flex flex-col gap-3" aria-busy>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : model.isError ? (
        <QueryError onRetry={model.retry} />
      ) : (
        <>
          {model.groups.map((group) => (
            <section key={group.key} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">{group.title}</h3>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                {group.fields.map((field) => (
                  <div
                    key={field.key}
                    className={cn("flex flex-col gap-0.5", field.key === "bio" && "col-span-2")}
                  >
                    <dt className="text-xs text-muted-foreground">{field.label}</dt>
                    <dd className="break-words">{field.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
          {model.documents.map((group) => (
            <section key={group.kind} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">{group.title}</h3>
              {group.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("noDocuments")}</p>
              ) : (
                <ul
                  className="flex flex-col gap-2 text-sm"
                  data-testid={`review-${group.kind}-list`}
                >
                  {group.items.map((document) => (
                    <li
                      key={`${document.name}-${document.url}`}
                      className="flex items-center gap-2"
                    >
                      {document.isImage && document.url && (
                        // A small preview of the uploaded file; the link opens the full image.
                        <Avatar className="size-10 rounded-md after:rounded-md">
                          <AvatarImage src={document.url} alt="" className="rounded-md" />
                          <AvatarFallback className="rounded-md" />
                        </Avatar>
                      )}
                      {document.url ? (
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {document.name}
                        </a>
                      ) : (
                        document.name
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
