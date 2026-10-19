import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { tasksListQuery } from "@/features/tasks/api/tasks.queries";
import { TasksTable } from "@/features/tasks/components/tasks-table";
import { loadTasksSearchParams } from "@/features/tasks/tasks.search-params";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";
import { PrefetchBoundary } from "@/server/query/prefetch-boundary";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/examples/data">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Examples.data", ROUTES.examplesData);
}

export default async function DataExamplePage({
  searchParams,
}: PageProps<"/[locale]/examples/data">) {
  const t = await getTranslations("Examples.data");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <PrefetchBoundary
        queries={[tasksListQuery.with(loadTasksSearchParams(searchParams))]}
        fallback={<DataTableSkeleton />}
      >
        <TasksTable />
      </PrefetchBoundary>
    </>
  );
}
