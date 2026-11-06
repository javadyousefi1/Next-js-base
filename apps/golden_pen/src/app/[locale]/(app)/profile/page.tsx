import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { ProfileContent } from "@/features/profile/components/profile-content";
import { ProfileSkeleton } from "@/features/profile/components/profile-skeleton";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/profile">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Profile", ROUTES.profile);
}

export default async function ProfilePage() {
  const t = await getTranslations("Profile");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {/* The skeleton of the first tab; `ProfileContent` swaps in the one of the tab in the URL. */}
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </>
  );
}
