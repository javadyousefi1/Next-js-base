import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { HooksExample } from "@/features/examples/components/hooks-example";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/examples/hooks">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Examples.hooks", ROUTES.examplesHooks);
}

export default async function HooksExamplePage() {
  const t = await getTranslations("Examples.hooks");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <HooksExample />
    </>
  );
}
