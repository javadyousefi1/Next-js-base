import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { AccessExample } from "@/features/examples/components/access-example";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/examples/access">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Examples.access", ROUTES.examplesAccess);
}

export default async function AccessExamplePage() {
  const t = await getTranslations("Examples.access");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <AccessExample />
    </>
  );
}
