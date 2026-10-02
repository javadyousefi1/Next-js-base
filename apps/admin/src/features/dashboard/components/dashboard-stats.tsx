import { Card, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Skeleton } from "@repo/ui/components/skeleton";
import { getFormatter, getTranslations } from "next-intl/server";
import { connection } from "next/server";

import { getDashboardStats } from "../server/dashboard-stats";

/**
 * Server Component (streamed inside <Suspense>). `connection()` defers it to request time,
 * so `next build` never calls the API; the `use cache` result is then reused across requests.
 */
export async function DashboardStats() {
  await connection();
  const [stats, t, format] = await Promise.all([
    getDashboardStats(),
    getTranslations("Dashboard.stats"),
    getFormatter(),
  ]);

  const cards = [
    { label: t("totalUsers"), value: stats.totalUsers },
    { label: t("admins"), value: stats.roles.admin },
    { label: t("moderators"), value: stats.roles.moderator },
    { label: t("members"), value: stats.roles.user },
  ];

  return (
    <section className="flex flex-col gap-2">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardHeader>
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-3xl tabular-nums">{format.number(card.value)}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {t("generatedAt", {
          time: format.dateTime(new Date(stats.generatedAt), { timeStyle: "medium" }),
        })}
      </p>
    </section>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} className="h-24" />
      ))}
    </div>
  );
}
