"use client";

import { Card, CardContent } from "@repo/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { useTranslations } from "next-intl";

import { UiActionsTab } from "./ui-actions-tab";
import { UiDisplayTab } from "./ui-display-tab";
import { UiFeedbackTab } from "./ui-feedback-tab";
import { UiFormsTab } from "./ui-forms-tab";
import { UiOverlaysTab } from "./ui-overlays-tab";

const TABS = [
  { value: "actions", Content: UiActionsTab },
  { value: "forms", Content: UiFormsTab },
  { value: "feedback", Content: UiFeedbackTab },
  { value: "overlays", Content: UiOverlaysTab },
  { value: "display", Content: UiDisplayTab },
] as const;

/** Every `@repo/ui` component, grouped in tabs. */
export function UiExample() {
  const t = useTranslations("Examples.ui");

  return (
    <Tabs defaultValue="actions" className="gap-4">
      <TabsList className="max-w-full overflow-x-auto">
        {TABS.map(({ value }) => (
          <TabsTrigger key={value} value={value}>
            {t(`tabs.${value}`)}
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map(({ value, Content }) => (
        <TabsContent key={value} value={value}>
          <Card>
            <CardContent className="flex flex-col gap-6">
              <Content />
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
