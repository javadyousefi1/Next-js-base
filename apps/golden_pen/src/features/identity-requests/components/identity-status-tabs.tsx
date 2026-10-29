"use client";

import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { useTranslations } from "next-intl";

import { useIdentityStatusTab } from "../hooks/use-identity-status-tab";

/** The status filter above the table: one tab per status, «در انتظار بررسی» first (the default). */
export function IdentityStatusTabs() {
  const t = useTranslations("IdentityRequests");
  const status = useIdentityStatusTab();

  return (
    <Tabs value={status.value} onValueChange={status.select}>
      <TabsList aria-label={t("tabsLabel")} className="max-w-full overflow-x-auto">
        {status.tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="px-3">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
