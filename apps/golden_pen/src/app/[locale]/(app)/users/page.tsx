import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { DataTablePlaceholder } from "@/components/data-table/data-table-placeholder";
import { DataTableToolbarPlaceholder } from "@/components/data-table/data-table-toolbar-placeholder";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { usersListQuery } from "@/features/users/api/users.queries";
import { UsersTable } from "@/features/users/components/users-table";
import { UsersToolbar } from "@/features/users/components/users-toolbar";
import { loadUsersSearchParams } from "@/features/users/users.search-params";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";
import { PrefetchBoundary } from "@/server/query/prefetch-boundary";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/users">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Users", ROUTES.users);
}

export default async function UsersPage({ searchParams }: PageProps<"/[locale]/users">) {
  const t = await getTranslations("Users");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="flex flex-col gap-4">
        <Suspense fallback={<DataTableToolbarPlaceholder />}>
          <UsersToolbar />
        </Suspense>
        <PrefetchBoundary
          queries={[usersListQuery.with(loadUsersSearchParams(searchParams))]}
          fallback={<DataTablePlaceholder />}
        >
          <UsersTable />
        </PrefetchBoundary>
      </div>
    </>
  );
}
