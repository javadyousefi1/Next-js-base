import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { getFormatter, getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { getRedisExample } from "../server/redis-example";

/** Server Component (streamed inside `<Suspense>`): a value cached in Redis with `remember`. */
export async function RedisCacheCard() {
  await connection();
  const [example, t, format] = await Promise.all([
    getRedisExample(),
    getTranslations("Examples.redis.cache"),
    getFormatter(),
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
          <dt className="text-muted-foreground">{t("value")}</dt>
          <dd className="font-mono text-lg">{example.value}</dd>
          <dt className="text-muted-foreground">{t("computedAt")}</dt>
          <dd>{format.dateTime(new Date(example.computedAt), { timeStyle: "medium" })}</dd>
        </dl>
        <p className="text-muted-foreground">
          {example.connected ? t("connected") : t("disconnected")}
        </p>
      </CardContent>
    </Card>
  );
}

export function RedisCacheCardSkeleton() {
  return <Skeleton className="h-52 w-full rounded-xl" />;
}
