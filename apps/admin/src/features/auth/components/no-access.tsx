import { buttonVariants } from "@repo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@repo/ui/components/empty";
import { useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";

/** Shown instead of a page the user may not open (the page's own `<h1>` is not rendered). */
export function NoAccess() {
  const t = useTranslations("Access.noAccess");

  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle role="heading" aria-level={1}>
          {t("title")}
        </EmptyTitle>
        <EmptyDescription>{t("description")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {/* A real link (Base UI's Button would turn it into role="button"), styled as a button. */}
        <Link href={ROUTES.dashboard} className={buttonVariants({ variant: "outline" })}>
          {t("back")}
        </Link>
      </EmptyContent>
    </Empty>
  );
}
