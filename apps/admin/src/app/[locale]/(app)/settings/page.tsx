import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { AppearanceCard, LanguageCard } from "@/features/preferences/components/preferences-cards";
import { InstallAppCard } from "@/features/pwa/components/install-app-card";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/settings">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Settings", ROUTES.settings);
}

export default async function SettingsPage() {
  const t = await getTranslations("Settings");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid gap-4 lg:grid-cols-2">
        <AppearanceCard />
        <LanguageCard />
        <InstallAppCard />
      </div>
    </>
  );
}
