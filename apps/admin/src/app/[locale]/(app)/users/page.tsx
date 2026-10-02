import { HydrationBoundary } from "@tanstack/react-query";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { usersColumns } from "@/features/users/components/users-columns";
import { UsersTable } from "@/features/users/components/users-table";
import { prefetchUsersPage } from "@/features/users/server/users.prefetch";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]/users">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Users", ROUTES.users);
}

/** Request-time part: reads the URL + cookie, prefetches on the server, hydrates the client. */
async function UsersSection({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const state = await prefetchUsersPage(searchParams);
  return (
    <HydrationBoundary state={state}>
      <UsersTable />
    </HydrationBoundary>
  );
}

export default async function UsersPage({ searchParams }: PageProps<"/[locale]/users">) {
  const t = await getTranslations("Users");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <Suspense fallback={<DataTableSkeleton columns={usersColumns.length} />}>
        <UsersSection searchParams={searchParams} />
      </Suspense>
    </>
  );
}
