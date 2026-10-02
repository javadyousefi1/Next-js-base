import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { usersListQuery } from "@/features/users/api/users.queries";
import { UsersTable } from "@/features/users/components/users-table";
import { usersTable } from "@/features/users/users.table";
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
      <PrefetchBoundary
        queries={[usersListQuery.with(usersTable.loadParams(searchParams))]}
        fallback={<DataTableSkeleton />}
      >
        <UsersTable />
      </PrefetchBoundary>
    </>
  );
}
