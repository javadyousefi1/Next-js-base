import { buttonVariants } from "@repo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("Errors.notFound");

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("title")}</EmptyTitle>
          <EmptyDescription>{t("description")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link href={ROUTES.dashboard} className={buttonVariants({ variant: "outline" })}>
            {t("back")}
          </Link>
        </EmptyContent>
      </Empty>
    </main>
  );
}
