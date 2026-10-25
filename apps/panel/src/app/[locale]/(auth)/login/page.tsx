import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { ROUTES } from "@/config/routes";
import { LoginTabs } from "@/features/auth/components/login-tabs";
import { Link } from "@/i18n/navigation";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/login">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Auth", ROUTES.login);
}

export default async function LoginPage() {
  const t = await getTranslations("Auth");

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            <h1>{t("title")}</h1>
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* The forms read `?callbackUrl=` (useSearchParams) → need a Suspense boundary. */}
          <Suspense>
            <LoginTabs />
          </Suspense>
        </CardContent>
        <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
          {t("noAccount")}
          <Link href={ROUTES.register} className="font-medium text-foreground underline">
            {t("registerLink")}
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
