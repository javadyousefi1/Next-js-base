import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { ModalExample } from "@/features/examples/components/modal-example";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/examples/modal">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Examples.modal", ROUTES.examplesModal);
}

export default async function ModalExamplePage() {
  const t = await getTranslations("Examples.modal");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ModalExample />
    </>
  );
}
