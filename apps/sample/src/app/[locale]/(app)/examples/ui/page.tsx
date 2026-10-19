import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { UiExample } from "@/features/examples/components/ui-example";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/examples/ui">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Examples.ui", ROUTES.examplesUi);
}

export default async function UiExamplePage() {
  const t = await getTranslations("Examples.ui");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <UiExample />
    </>
  );
}
