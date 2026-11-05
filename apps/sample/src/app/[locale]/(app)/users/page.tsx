import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { UsersTable } from "@/features/users/components/users-table";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/users">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Users", ROUTES.users);
}

export default async function UsersPage() {
  const t = await getTranslations("Users");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {/* The table reads the URL (nuqs) and loads its data in the browser. */}
      <Suspense fallback={<DataTableSkeleton />}>
        <UsersTable />
      </Suspense>
    </>
  );
}
