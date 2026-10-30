import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { LandingPage } from "@/features/landing/components/landing-page";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const locale = await getLocaleParam(params);
  const t = await getTranslations({ locale, namespace: "Landing" });
  return {
    ...(await pageMetadata(locale, "Landing", ROUTES.landing)),
    title: { absolute: t("title") },
    openGraph: { title: t("title"), description: t("description"), url: ROUTES.landing },
    twitter: { card: "summary", title: t("title"), description: t("description") },
  };
}

export default function HomePage() {
  return <LandingPage />;
}
