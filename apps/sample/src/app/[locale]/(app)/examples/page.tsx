import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { ExamplesOverview } from "@/features/examples/components/examples-overview";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/examples">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Examples", ROUTES.examples);
}

export default async function ExamplesPage() {
  const t = await getTranslations("Examples");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ExamplesOverview />
    </>
  );
}
