"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { useTranslations } from "next-intl";

import { OtpLoginForm } from "./otp-login-form";
import { PasswordLoginForm } from "./password-login-form";

/** Two ways to sign in: phone + password, or phone + SMS code. */
export function LoginTabs() {
  const t = useTranslations("Auth");

  return (
    <Tabs defaultValue="password" className="gap-6">
      <TabsList className="w-full">
        <TabsTrigger value="password">{t("tabs.password")}</TabsTrigger>
        <TabsTrigger value="otp">{t("tabs.otp")}</TabsTrigger>
      </TabsList>
      <TabsContent value="password">
        <PasswordLoginForm />
      </TabsContent>
      <TabsContent value="otp">
        <OtpLoginForm />
      </TabsContent>
    </Tabs>
  );
}
