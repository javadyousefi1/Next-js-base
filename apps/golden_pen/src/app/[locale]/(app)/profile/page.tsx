import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { profileQuery } from "@/features/profile/api/profile.queries";
import { ProfileContent } from "@/features/profile/components/profile-content";
import { ProfileLoading } from "@/features/profile/components/profile-loading";
import { ProfileSkeleton } from "@/features/profile/components/profile-skeleton";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";
import { PrefetchBoundary } from "@/server/query/prefetch-boundary";

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
      <PrefetchBoundary
        queries={[profileQuery.with()]}
        fallback={
          <Suspense fallback={<ProfileSkeleton />}>
            <ProfileLoading />
          </Suspense>
        }
      >
        <ProfileContent />
      </PrefetchBoundary>
    </>
  );
}
