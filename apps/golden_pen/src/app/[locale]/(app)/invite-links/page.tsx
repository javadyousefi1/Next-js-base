import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { inviteLinksListQuery } from "@/features/invite-links/api/invite-links.queries";
import { InviteLinkCreateButton } from "@/features/invite-links/components/invite-link-create-button";
import { InviteLinksTable } from "@/features/invite-links/components/invite-links-table";
import { loadInviteLinksSearchParams } from "@/features/invite-links/invite-links.search-params";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";
import { PrefetchBoundary } from "@/server/query/prefetch-boundary";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/invite-links">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "InviteLinks", ROUTES.inviteLinks);
}

export default async function InviteLinksPage({
  searchParams,
}: PageProps<"/[locale]/invite-links">) {
  const t = await getTranslations("InviteLinks");

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={<InviteLinkCreateButton />}
      />
      <PrefetchBoundary
        queries={[inviteLinksListQuery.with(loadInviteLinksSearchParams(searchParams))]}
        fallback={<DataTableSkeleton />}
      >
        <InviteLinksTable />
      </PrefetchBoundary>
    </>
  );
}
