import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { JalaliPickersExample } from "@/features/examples/components/jalali-pickers-example";
import { JalaliToolsExample } from "@/features/examples/components/jalali-tools-example";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/examples/jalali">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Examples.jalali", ROUTES.examplesJalali);
}

export default async function JalaliExamplePage() {
  const t = await getTranslations("Examples.jalali");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <JalaliToolsExample />
      <JalaliPickersExample />
    </>
  );
}
