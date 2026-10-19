import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { CalendarShowcase } from "@/features/calendar/components/calendar-showcase";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/calendar">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Calendar", ROUTES.calendar);
}

export default async function CalendarPage() {
  const t = await getTranslations("Calendar");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <CalendarShowcase />
    </>
  );
}
