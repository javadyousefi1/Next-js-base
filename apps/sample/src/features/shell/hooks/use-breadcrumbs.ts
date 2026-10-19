"use client";

import { useTranslations } from "next-intl";

import { usePathname } from "@/i18n/navigation";

import { breadcrumbTrail } from "../breadcrumb-trail";

/** Breadcrumb items for the current (locale-less) pathname; the last one is the current page. */
export function useBreadcrumbs() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const trail = breadcrumbTrail(pathname);
  return trail.map(({ href, labelKey }, index) => ({
    href,
    label: t(labelKey),
    isCurrent: index === trail.length - 1,
  }));
}
