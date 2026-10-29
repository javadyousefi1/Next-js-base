import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { DataTablePlaceholder } from "@/components/data-table/data-table-placeholder";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { identityRequestsListQuery } from "@/features/identity-requests/api/identity-requests.queries";
import { IdentityRequestsTable } from "@/features/identity-requests/components/identity-requests-table";
import { IdentityRequestsToolbar } from "@/features/identity-requests/components/identity-requests-toolbar";
import { IdentityRequestsToolbarPlaceholder } from "@/features/identity-requests/components/identity-requests-toolbar-placeholder";
import { IDENTITY_REQUESTS_COLUMN_KEYS } from "@/features/identity-requests/identity-requests-column-keys";
import { loadIdentityRequestsSearchParams } from "@/features/identity-requests/identity-requests.search-params";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";
import { PrefetchBoundary } from "@/server/query/prefetch-boundary";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/identity-requests">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "IdentityRequests", ROUTES.identityRequests);
}

export default async function IdentityRequestsPage({
  searchParams,
}: PageProps<"/[locale]/identity-requests">) {
  const t = await getTranslations("IdentityRequests");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="flex flex-col gap-4">
        <Suspense fallback={<IdentityRequestsToolbarPlaceholder />}>
          <IdentityRequestsToolbar />
        </Suspense>
        <PrefetchBoundary
          queries={[identityRequestsListQuery.with(loadIdentityRequestsSearchParams(searchParams))]}
          fallback={
            <DataTablePlaceholder
              headers={IDENTITY_REQUESTS_COLUMN_KEYS.map((key) => t(`columns.${key}`))}
            />
          }
        >
          <IdentityRequestsTable />
        </PrefetchBoundary>
      </div>
    </>
  );
}
