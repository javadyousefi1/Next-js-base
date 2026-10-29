import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Dashboard", ROUTES.dashboard);
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <DashboardContent />
    </>
  );
}
