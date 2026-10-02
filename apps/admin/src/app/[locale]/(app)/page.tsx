import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import {
  DashboardStats,
  DashboardStatsSkeleton,
} from "@/features/dashboard/components/dashboard-stats";
import { FeaturesCard } from "@/features/dashboard/components/features-card";
import { RefreshStatsButton } from "@/features/dashboard/components/refresh-stats-button";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Dashboard", ROUTES.dashboard);
}

export default async function DashboardPage() {
  const t = await getTranslations("Dashboard");

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={<RefreshStatsButton />}
      />
      <Suspense fallback={<DashboardStatsSkeleton />}>
        <DashboardStats />
      </Suspense>
      <FeaturesCard />
    </>
  );
}
