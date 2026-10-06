"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/breadcrumb";
import { cn } from "@repo/ui/lib/utils";
import { useTranslations } from "next-intl";
import { Fragment } from "react";

import { Link } from "@/i18n/navigation";

import { useBreadcrumbs } from "../hooks/use-breadcrumbs";

/** Trail of the current page, derived from the URL (`config/breadcrumbs.ts`). */
export function AppBreadcrumbs() {
  const t = useTranslations("Nav");
  const crumbs = useBreadcrumbs();
  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb aria-label={t("breadcrumb")}>
      <BreadcrumbList>
        {crumbs.map((crumb) => (
          <Fragment key={crumb.href}>
            {/* Small screens show the current page only. */}
            <BreadcrumbItem className={cn(!crumb.isCurrent && "hidden md:inline-flex")}>
              {crumb.isCurrent ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={crumb.href} />}>{crumb.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!crumb.isCurrent && <BreadcrumbSeparator className="hidden md:inline-flex" />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
