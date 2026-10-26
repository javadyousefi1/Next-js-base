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
import { RegisterForm } from "@/features/auth/components/register-form";
import { Link } from "@/i18n/navigation";
import { getLocaleParam } from "@/i18n/params";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/register">): Promise<Metadata> {
  return pageMetadata(await getLocaleParam(params), "Register", ROUTES.register);
}

export default async function RegisterPage() {
  const t = await getTranslations("Register");

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
          {/* The form reads `?callbackUrl=` (useSearchParams) → needs a Suspense boundary. */}
          <Suspense>
            <RegisterForm />
          </Suspense>
        </CardContent>
        <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
          {t("haveAccount")}
          <Link href={ROUTES.login} className="font-medium text-foreground underline">
            {t("loginLink")}
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
