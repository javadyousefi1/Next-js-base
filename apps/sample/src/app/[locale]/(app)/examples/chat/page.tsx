import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { ChatExample } from "@/features/chat/components/chat-example";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/examples/chat">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Examples.chat", ROUTES.examplesChat);
}

export default async function ChatExamplePage() {
  const t = await getTranslations("Examples.chat");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <ChatExample />
    </>
  );
}
