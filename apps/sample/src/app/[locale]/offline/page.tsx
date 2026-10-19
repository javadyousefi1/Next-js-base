import { WifiOffIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/offline">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Offline", ROUTES.offline);
}

/** Static page precached by `public/sw.js` and served when a navigation fails offline. */
export default async function OfflinePage() {
  const t = await getTranslations("Offline");

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <WifiOffIcon className="size-10 text-muted-foreground" aria-hidden />
      <h1 className="text-xl font-semibold">{t("title")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{t("description")}</p>
    </main>
  );
}
