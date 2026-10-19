import { Badge } from "@repo/ui/components/badge";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/card";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { EXAMPLES } from "@/config/examples";
import { Link } from "@/i18n/navigation";

/** One card per example page (`src/config/examples.ts`). */
export function ExamplesOverview() {
  const t = useTranslations("Examples");

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {EXAMPLES.map((example) => (
        <Card key={example.key}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <example.icon className="size-4 text-muted-foreground" />
              <Link href={example.href} className="hover:underline">
                {t(`${example.key}.title`)}
              </Link>
            </CardTitle>
            <CardDescription>{t(`${example.key}.description`)}</CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1" aria-label={t("packages")}>
              {example.packages.map((name) => (
                <Badge key={name} variant="secondary">
                  {name}
                </Badge>
              ))}
            </div>
            <Link
              href={example.href}
              className="inline-flex items-center gap-1 text-sm font-medium"
              aria-label={`${t("open")}: ${t(`${example.key}.title`)}`}
            >
              {t("open")}
              <ArrowRightIcon className="size-4 rtl:rotate-180" />
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
