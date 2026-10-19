import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { ROUTES } from "@/config/routes";
import { RateLimitCard } from "@/features/examples/components/rate-limit-card";
import {
  RedisCacheCard,
  RedisCacheCardSkeleton,
} from "@/features/examples/components/redis-cache-card";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/examples/redis">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Examples.redis", ROUTES.examplesRedis);
}

export default async function RedisExamplePage() {
  const t = await getTranslations("Examples.redis");

  return (
    <>
      <PageHeader title={t("title")} description={t("description")} />
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Suspense fallback={<RedisCacheCardSkeleton />}>
          <RedisCacheCard />
        </Suspense>
        <RateLimitCard />
      </div>
    </>
  );
}
