import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { CheckIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

const FEATURE_KEYS = ["bff", "query", "table", "i18n", "cache", "pwa", "mocks"] as const;

export async function FeaturesCard() {
  const t = await getTranslations("Dashboard.features");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="grid gap-3 text-sm md:grid-cols-2">
          {FEATURE_KEYS.map((key) => (
            <li key={key} className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{t(`items.${key}`)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
