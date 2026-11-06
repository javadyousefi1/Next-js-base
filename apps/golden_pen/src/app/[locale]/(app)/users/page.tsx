import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { DataTablePlaceholder } from "@/components/data-table/data-table-placeholder";
import { DataTableToolbarPlaceholder } from "@/components/data-table/data-table-toolbar-placeholder";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { UsersTable } from "@/features/users/components/users-table";
import { UsersToolbar } from "@/features/users/components/users-toolbar";
import { USERS_COLUMN_KEYS } from "@/features/users/users-column-keys";
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
      <div className="flex flex-col gap-4">
        <Suspense fallback={<DataTableToolbarPlaceholder />}>
          <UsersToolbar />
        </Suspense>
        <Suspense
          fallback={
            <DataTablePlaceholder headers={USERS_COLUMN_KEYS.map((key) => t(`columns.${key}`))} />
          }
        >
          <UsersTable />
        </Suspense>
      </div>
    </>
  );
}
