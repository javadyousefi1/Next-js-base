import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { TasksTable } from "@/features/tasks/components/tasks-table";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/examples/data">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Examples.data", ROUTES.examplesData);
}

export default async function DataExamplePage() {
  const t = await getTranslations("Examples.data");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      {/* The table reads the URL (nuqs) and loads its data in the browser. */}
      <Suspense fallback={<DataTableSkeleton />}>
        <TasksTable />
      </Suspense>
    </>
  );
}
